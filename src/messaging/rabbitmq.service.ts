import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect() {
    try {
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Configurar exchanges padrão
      await this.setupExchanges();
      
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  private async setupExchanges() {
    // Exchange para eventos de pagamento
    await this.channel.assertExchange('payment.events', 'topic', { durable: true });
    
    // Exchange geral do marketplace
    await this.channel.assertExchange('marketplace.events', 'topic', { durable: true });
  }

  async publishPaymentEvent(eventType: string, data: any) {
    const routingKey = `payment.${eventType}`;
    const message = {
      eventType,
      data,
      timestamp: new Date(),
      source: 'payments-service',
    };

    await this.channel.publish(
      'payment.events',
      routingKey,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`Published payment event: ${eventType}`);
  }

  async publishMarketplaceEvent(eventType: string, data: any) {
    const message = {
      eventType,
      data,
      timestamp: new Date(),
      source: 'payments-service',
    };

    await this.channel.publish(
      'marketplace.events',
      eventType,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`Published marketplace event: ${eventType}`);
  }

  async consumeEvents(queueName: string, callback: (data: any) => Promise<void>) {
    await this.channel.assertQueue(queueName, { durable: true });
    
    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const data = JSON.parse(msg.content.toString());
          await callback(data);
          this.channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          this.channel.nack(msg, false, false); // Rejeita e não reenvia
        }
      }
    });

    console.log(`Started consuming from queue: ${queueName}`);
  }

  async createQueue(queueName: string, routingKey: string, exchange: string = 'marketplace.events') {
    await this.channel.assertQueue(queueName, { durable: true });
    await this.channel.bindQueue(queueName, exchange, routingKey);
    console.log(`Created queue: ${queueName} with routing key: ${routingKey}`);
  }

  async getQueueInfo(queueName: string) {
    try {
      const queueInfo = await this.channel.checkQueue(queueName);
      return {
        name: queueName,
        messages: queueInfo.messageCount,
        consumers: queueInfo.consumerCount,
      };
    } catch (error) {
      console.error(`Error getting queue info for ${queueName}:`, error);
      return null;
    }
  }
}
