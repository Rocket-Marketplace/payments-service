import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentQueueService, PaymentOrderMessage } from './payment-queue.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class PaymentConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentConsumerService.name);

  constructor(
    private readonly paymentQueueService: PaymentQueueService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  async startConsuming() {
    try {
      await this.paymentQueueService.consumePaymentOrders(
        this.processPaymentOrder.bind(this)
      );
    } catch (error) {
      this.logger.error('Failed to start consuming payment orders:', error);
    }
  }

  private async processPaymentOrder(message: PaymentOrderMessage): Promise<void> {
    try {
      this.logger.log(`Processing payment order for order ${message.orderId}`);

      // Create payment record
      const paymentResult = await this.paymentsService.processPayment({
        orderId: message.orderId,
        amount: message.amount,
        paymentMethod: message.paymentMethod as any,
        buyerId: message.userId,
        description: message.description,
      });

      this.logger.log(`Payment processed for order ${message.orderId}: ${paymentResult.status}`);
    } catch (error) {
      this.logger.error(`Failed to process payment for order ${message.orderId}:`, error);
      throw error;
    }
  }
}
