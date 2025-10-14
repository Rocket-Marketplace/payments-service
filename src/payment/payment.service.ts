import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    // Inicializa o Stripe com a chave secreta do .env
    const secretKey = this.configService.get('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16', // Use a versão compatível da API
      });
    }
  }

  // Método para criar uma intenção de pagamento
  async createPaymentIntent(amount: number, currency: string = 'brl') {
    if (!this.stripe) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // O valor deve ser em centavos
        currency: currency,
        automatic_payment_methods: { enabled: true }, // Habilita métodos de pagamento dinâmicos
      });

      return {
        clientSecret: paymentIntent.client_secret,
        status: paymentIntent.status,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      // Trate os erros da API do Stripe aqui
      throw new Error(`Error creating payment intent: ${error.message}`);
    }
  }

  // Método para confirmar um pagamento
  async confirmPayment(paymentIntentId: string) {
    if (!this.stripe) {
      throw new Error('Stripe not configured - missing STRIPE_SECRET_KEY');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Converte de centavos para reais
        currency: paymentIntent.currency,
      };
    } catch (error) {
      throw new Error(`Error retrieving payment intent: ${error.message}`);
    }
  }

  // Método para processar pagamento (simulação para desenvolvimento)
  async processPayment(amount: number, paymentMethod: string) {
    if (!this.stripe) {
      // Se o Stripe não estiver configurado, simula o pagamento
      return {
        success: true,
        transactionId: `sim_${Date.now()}`,
        amount,
        paymentMethod,
        status: 'succeeded',
        message: 'Payment processed successfully (simulated)',
      };
    }

    try {
      const paymentIntent = await this.createPaymentIntent(amount);
      return {
        success: true,
        transactionId: paymentIntent.paymentIntentId,
        amount,
        paymentMethod,
        status: paymentIntent.status,
        clientSecret: paymentIntent.clientSecret,
        message: 'Payment intent created successfully',
      };
    } catch (error) {
      return {
        success: false,
        transactionId: null,
        amount,
        paymentMethod,
        status: 'failed',
        message: error.message,
      };
    }
  }
}
