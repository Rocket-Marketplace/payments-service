import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  PaymentMethod,
  PaymentStatus,
} from '../payments/entities/payment.entity';

export interface PaymentGatewayRequest {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  buyerId: string;
}

export interface PaymentGatewayResponse {
  transactionId: string;
  status: PaymentStatus;
  message?: string;
  processingFee?: number;
}

@Injectable()
export class PaymentGatewayService {
  private readonly gatewayUrl =
    process.env.PAYMENT_GATEWAY_URL || 'https://api.stripe.com/v1';
  private readonly gatewayApiKey =
    process.env.PAYMENT_GATEWAY_API_KEY || 'sk_test_mock_key';

  constructor(private readonly httpService: HttpService) {}

  async processPayment(
    request: PaymentGatewayRequest,
  ): Promise<PaymentGatewayResponse> {
    try {
      const gatewayRequest = this.buildGatewayRequest(request);

      const response = await firstValueFrom(
        this.httpService.post(`${this.gatewayUrl}/charges`, gatewayRequest, {
          headers: {
            Authorization: `Bearer ${this.gatewayApiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return this.parseGatewayResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 402) {
        throw new HttpException(
          'Payment failed: Insufficient funds',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (error.response?.status === 400) {
        throw new HttpException(
          'Payment failed: Invalid payment method',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Payment gateway error',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async refundPayment(
    transactionId: string,
    amount?: number,
  ): Promise<PaymentGatewayResponse> {
    try {
      const refundRequest = amount ? { amount: Math.round(amount * 100) } : {};

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.gatewayUrl}/charges/${transactionId}/refunds`,
          refundRequest,
          {
            headers: {
              Authorization: `Bearer ${this.gatewayApiKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return this.parseGatewayResponse(response.data);
    } catch {
      throw new HttpException('Refund failed', HttpStatus.BAD_REQUEST);
    }
  }

  private buildGatewayRequest(request: PaymentGatewayRequest): any {
    const baseRequest = {
      amount: Math.round(request.amount * 100),
      currency: request.currency || 'brl',
      description:
        request.description || `Payment for buyer ${request.buyerId}`,
    };

    switch (request.paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return {
          ...baseRequest,
          source: 'tok_visa', // Mock token for testing
        };
      case PaymentMethod.DEBIT_CARD:
        return {
          ...baseRequest,
          source: 'tok_visa_debit', // Mock token for testing
        };
      case PaymentMethod.PIX:
        return {
          ...baseRequest,
          payment_method_types: ['pix'],
        };
      case PaymentMethod.BOLETO:
        return {
          ...baseRequest,
          payment_method_types: ['boleto'],
        };
      case PaymentMethod.PAYPAL:
        return {
          ...baseRequest,
          payment_method_types: ['paypal'],
        };
      default:
        throw new HttpException(
          'Unsupported payment method',
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private parseGatewayResponse(data: any): PaymentGatewayResponse {
    const status = this.mapGatewayStatus(String(data.status));

    return {
      transactionId: String(data.id),
      status,
      message: data.failure_message || data.outcome?.seller_message,
      processingFee: data.application_fee_amount
        ? Number(data.application_fee_amount) / 100
        : 0,
    };
  }

  private mapGatewayStatus(gatewayStatus: string): PaymentStatus {
    switch (gatewayStatus) {
      case 'succeeded':
        return PaymentStatus.COMPLETED;
      case 'pending':
        return PaymentStatus.PROCESSING;
      case 'failed':
        return PaymentStatus.FAILED;
      case 'canceled':
        return PaymentStatus.CANCELLED;
      default:
        return PaymentStatus.PENDING;
    }
  }
}
