import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsUUID, Min } from 'class-validator';
import { PaymentMethod } from '../../payments/entities/payment.entity';

export class ProcessPaymentDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Payment amount', example: 99.99 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Buyer ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  buyerId: string;

  @ApiProperty({
    description: 'Payment description',
    example: 'Order #12345 payment',
    required: false,
  })
  @IsString()
  description?: string;
}
