import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import { PaymentsService } from '../payments/payments.service';
import { PaymentService } from '../payment/payment.service';

export interface PaymentOrderMessage {
  orderId: string;
  userId: string;
  amount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
  description?: string;
}

@Injectable()
export class PaymentRabbitConsumerService implements OnModuleInit {
  private readonly logger = new Logger(PaymentRabbitConsumerService.name);
  private readonly QUEUE_NAME = 'payment_orders_queue';
  private readonly ROUTING_KEY = 'payment.order';
  private readonly EXCHANGE = 'payments';

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly paymentsService: PaymentsService,
    private readonly paymentService: PaymentService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  async startConsuming() {
    try {
      // Configurar o consumer para a fila de pagamentos
      await this.rabbitMQService.createQueue(this.QUEUE_NAME, this.ROUTING_KEY, this.EXCHANGE);
      
      await this.rabbitMQService.consumeEvents(
        this.QUEUE_NAME,
        this.processPaymentOrder.bind(this)
      );
      
      this.logger.log('Started consuming payment orders from RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to start consuming payment orders:', error);
    }
  }

  private async processPaymentOrder(message: PaymentOrderMessage): Promise<void> {
    try {
      this.logger.log(`Processing payment order for order ${message.orderId}`);
      this.logger.log(`Payment details: ${JSON.stringify(message)}`);

      // Processar o pagamento usando o Stripe (ou simulação)
      const paymentResult = await this.paymentService.processPayment(
        message.amount,
        message.paymentMethod
      );

      // Criar registro de pagamento no banco
      const paymentRecord = await this.paymentsService.processPayment({
        orderId: message.orderId,
        amount: message.amount,
        paymentMethod: message.paymentMethod as any,
        buyerId: message.userId,
        description: message.description || `Payment for order ${message.orderId}`,
      });

      this.logger.log(`Payment processed successfully for order ${message.orderId}`);
      this.logger.log(`Payment result: ${JSON.stringify(paymentResult)}`);
      this.logger.log(`Payment record: ${JSON.stringify(paymentRecord)}`);

      // Aqui você poderia publicar um evento de volta para o checkout-service
      // informando que o pagamento foi processado
      
    } catch (error) {
      this.logger.error(`Failed to process payment for order ${message.orderId}:`, error);
      throw error;
    }
  }
}
