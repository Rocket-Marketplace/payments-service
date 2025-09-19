import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BOLETO = 'boleto',
  PAYPAL = 'paypal',
}

@Entity('payments')
export class Payment {
  @ApiProperty({ description: 'Payment ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Order ID' })
  @Column({ type: 'uuid' })
  @Index()
  orderId: string;

  @ApiProperty({ description: 'Buyer ID' })
  @Column({ type: 'uuid' })
  @Index()
  buyerId: string;

  @ApiProperty({ description: 'Payment amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus })
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'External payment ID from payment gateway' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  externalPaymentId: string | null;

  @ApiProperty({ description: 'Payment gateway response' })
  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse: any;

  @ApiProperty({ description: 'Error message if payment failed' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @ApiProperty({ description: 'Payment processing fee' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  processingFee: number;

  @ApiProperty({ description: 'Currency code' })
  @Column({ type: 'varchar', length: 3, default: 'BRL' })
  currency: string;

  @ApiProperty({ description: 'Payment description' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Refund amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @ApiProperty({ description: 'Refund reason' })
  @Column({ type: 'text', nullable: true })
  refundReason: string | null;

  @ApiProperty({ description: 'Payment processed date' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @ApiProperty({ description: 'Payment failed date' })
  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date | null;

  @ApiProperty({ description: 'Creation date' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  @UpdateDateColumn()
  updatedAt: Date;
}
