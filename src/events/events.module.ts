import { Module, forwardRef } from '@nestjs/common';
import { PaymentRabbitConsumerService } from './payment-rabbit-consumer.service';
import { PaymentsModule } from '../payments/payments.module';
import { PaymentModule } from '../payment/payment.module';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    forwardRef(() => PaymentsModule),
    PaymentModule,
    MessagingModule,
  ],
  providers: [PaymentRabbitConsumerService],
  exports: [PaymentRabbitConsumerService],
})
export class EventsModule {}
