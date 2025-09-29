import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MessagingClientService } from './messaging-client.service';
import { PaymentQueueService } from './payment-queue.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [HttpModule, forwardRef(() => PaymentsModule)],
  providers: [MessagingClientService, PaymentQueueService],
  exports: [PaymentQueueService],
})
export class EventsModule {}
