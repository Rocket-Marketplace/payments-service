import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { EventsModule } from '../events/events.module';
import { PaymentConsumerService } from '../events/payment-consumer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule, forwardRef(() => EventsModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGatewayService, PaymentConsumerService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
