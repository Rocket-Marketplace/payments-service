import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { ProcessPaymentDto } from '../common/dto/process-payment.dto';
import { RefundPaymentDto } from '../common/dto/refund-payment.dto';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paymentGatewayService: PaymentGatewayService,
  ) {}

  async processPayment(
    processPaymentDto: ProcessPaymentDto,
  ): Promise<{ paymentId: string; status: string; message?: string }> {
    const { orderId, amount, paymentMethod, buyerId, description } =
      processPaymentDto;

    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already processed for this order');
    }

    const payment = this.paymentRepository.create({
      orderId,
      buyerId,
      amount,
      paymentMethod,
      description: description || `Payment for order ${orderId}`,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    try {
      const gatewayResponse = await this.paymentGatewayService.processPayment({
        amount,
        currency: 'BRL',
        paymentMethod,
        description: savedPayment.description,
        buyerId,
      });

      savedPayment.externalPaymentId = gatewayResponse.transactionId;
      savedPayment.status = gatewayResponse.status;
      savedPayment.processingFee = gatewayResponse.processingFee || 0;
      savedPayment.gatewayResponse = gatewayResponse;
      savedPayment.processedAt = new Date();

      if (gatewayResponse.status === PaymentStatus.FAILED) {
        savedPayment.failedAt = new Date();
        savedPayment.errorMessage = gatewayResponse.message;
      }

      await this.paymentRepository.save(savedPayment);

      return {
        paymentId: savedPayment.id,
        status: savedPayment.status,
        message: gatewayResponse.message,
      };
    } catch (error) {
      savedPayment.status = PaymentStatus.FAILED;
      savedPayment.failedAt = new Date();
      savedPayment.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      await this.paymentRepository.save(savedPayment);

      throw error;
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    return payment;
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentsByBuyer(buyerId: string): Promise<Payment[]> {
    return await this.paymentRepository.find({
      where: { buyerId },
      order: { createdAt: 'DESC' },
    });
  }

  async refundPayment(
    paymentId: string,
    refundPaymentDto: RefundPaymentDto,
  ): Promise<Payment> {
    const payment = await this.getPayment(paymentId);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    if (payment.refundAmount >= payment.amount) {
      throw new BadRequestException('Payment already fully refunded');
    }

    const refundAmount =
      refundPaymentDto.amount || payment.amount - payment.refundAmount;

    if (refundAmount > payment.amount - payment.refundAmount) {
      throw new BadRequestException('Refund amount exceeds available amount');
    }

    try {
      await this.paymentGatewayService.refundPayment(
        payment.externalPaymentId,
        refundAmount,
      );

      payment.refundAmount += refundAmount;
      payment.refundReason = refundPaymentDto.reason;

      if (payment.refundAmount >= payment.amount) {
        payment.status = PaymentStatus.REFUNDED;
      }

      await this.paymentRepository.save(payment);

      return payment;
    } catch (error) {
      throw new BadRequestException(
        `Refund failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
  ): Promise<Payment> {
    const payment = await this.getPayment(paymentId);

    payment.status = status;

    if (status === PaymentStatus.COMPLETED) {
      payment.processedAt = new Date();
    } else if (status === PaymentStatus.FAILED) {
      payment.failedAt = new Date();
    }

    return await this.paymentRepository.save(payment);
  }

  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
  }> {
    const [
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      pendingPayments,
    ] = await Promise.all([
      this.paymentRepository.count(),
      this.paymentRepository
        .createQueryBuilder('payment')
        .select('SUM(payment.amount)', 'total')
        .getRawOne()
        .then((result) => parseFloat(String(result.total)) || 0),
      this.paymentRepository.count({
        where: { status: PaymentStatus.COMPLETED },
      }),
      this.paymentRepository.count({ where: { status: PaymentStatus.FAILED } }),
      this.paymentRepository.count({
        where: { status: PaymentStatus.PENDING },
      }),
    ]);

    return {
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      pendingPayments,
    };
  }
}
