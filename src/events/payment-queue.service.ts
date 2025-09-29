import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MessagingClientService, MessagePayload } from './messaging-client.service';
import { PaymentsService } from '../payments/payments.service';

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
export class PaymentQueueService implements OnModuleInit {
  private readonly logger = new Logger(PaymentQueueService.name);
  private readonly QUEUE_NAME = 'payment_orders_queue';
  private readonly ROUTING_KEY = 'payment.order';

  constructor(
    private readonly messagingClientService: MessagingClientService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async onModuleInit() {
    await this.startConsuming();
  }

  private async startConsuming() {
    try {
      await this.messagingClientService.subscribeToQueue(
        this.QUEUE_NAME,
        this.ROUTING_KEY,
        this.processPaymentOrder.bind(this)
      );
    } catch (error) {
      this.logger.error('Failed to start consuming payment orders:', error);
    }
  }

  async consumePaymentOrders(handler: (message: PaymentOrderMessage) => Promise<void>): Promise<void> {
    try {
      await this.messagingClientService.subscribeToQueue(
        this.QUEUE_NAME,
        this.ROUTING_KEY,
        async (message: MessagePayload) => {
          if (message.type !== 'payment_order') {
            this.logger.warn(`Ignoring message type: ${message.type}`);
            return;
          }

          const paymentOrder: PaymentOrderMessage = message.data;
          await handler(paymentOrder);
        }
      );
    } catch (error) {
      this.logger.error('Failed to start consuming payment orders:', error);
      throw error;
    }
  }

  private async processPaymentOrder(message: MessagePayload): Promise<void> {
    try {
      if (message.type !== 'payment_order') {
        this.logger.warn(`Ignoring message type: ${message.type}`);
        return;
      }

      const paymentOrder: PaymentOrderMessage = message.data;
      this.logger.log(`Processing payment order for order ${paymentOrder.orderId}`);

      // Create payment record
      const paymentResult = await this.paymentsService.processPayment({
        orderId: paymentOrder.orderId,
        amount: paymentOrder.amount,
        paymentMethod: paymentOrder.paymentMethod as any,
        buyerId: paymentOrder.userId,
        description: paymentOrder.description,
      });

      this.logger.log(`Payment processed for order ${paymentOrder.orderId}: ${paymentResult.status}`);
    } catch (error) {
      this.logger.error(`Failed to process payment order:`, error);
      throw error;
    }
  }
}