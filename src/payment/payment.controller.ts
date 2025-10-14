import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

// DTO (Data Transfer Object) para validar o corpo da requisição
class CreatePaymentDto {
  amount: number;
  currency?: string;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a payment intent with Stripe' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPaymentIntent(@Body() createPaymentDto: CreatePaymentDto) {
    try {
      const { amount, currency = 'brl' } = createPaymentDto;
      if (!amount || amount <= 0) {
        throw new HttpException('Amount must be greater than 0', HttpStatus.BAD_REQUEST);
      }

      return await this.paymentService.createPaymentIntent(amount, currency);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('process')
  @ApiOperation({ summary: 'Process a payment (for internal use via RabbitMQ)' })
  @ApiResponse({ status: 200, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async processPayment(@Body() body: { amount: number; paymentMethod: string }) {
    try {
      const { amount, paymentMethod } = body;
      if (!amount || !paymentMethod) {
        throw new HttpException('Amount and payment method are required', HttpStatus.BAD_REQUEST);
      }

      return await this.paymentService.processPayment(amount, paymentMethod);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
