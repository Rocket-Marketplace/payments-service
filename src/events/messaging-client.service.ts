import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface MessagePayload {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  source: string;
  target?: string;
}

@Injectable()
export class MessagingClientService {
  private readonly logger = new Logger(MessagingClientService.name);
  private readonly messagingServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.messagingServiceUrl = this.configService.get<string>(
      'MESSAGING_SERVICE_URL', 
      'http://messaging-service:3005'
    );
  }

  async subscribeToQueue(
    queueName: string,
    routingKey: string,
    callback: (message: MessagePayload) => Promise<void>
  ): Promise<void> {
    try {
      // Create queue first
      await firstValueFrom(
        this.httpService.post(`${this.messagingServiceUrl}/messaging/queue/create`, {
          queueName,
          routingKey,
        })
      );

      // Subscribe to queue
      await firstValueFrom(
        this.httpService.post(`${this.messagingServiceUrl}/messaging/subscribe`, {
          queueName,
          routingKey,
        })
      );

      this.logger.log(`Subscribed to queue: ${queueName} with routing key: ${routingKey}`);
    } catch (error) {
      this.logger.error('Failed to subscribe to queue:', error);
      throw error;
    }
  }

  async publishMessage(
    routingKey: string, 
    messageType: string, 
    data: any, 
    source: string,
    target?: string
  ): Promise<void> {
    try {
      const message: MessagePayload = {
        id: this.generateMessageId(),
        type: messageType,
        data,
        timestamp: new Date(),
        source,
        target,
      };

      await firstValueFrom(
        this.httpService.post(`${this.messagingServiceUrl}/messaging/publish`, {
          routingKey,
          message,
        })
      );

      this.logger.log(`Message published: ${routingKey} - ${message.id}`);
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
      throw error;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
