import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { PaymentGatewayService } from '../services/payment-gateway.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), HttpModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentGatewayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
