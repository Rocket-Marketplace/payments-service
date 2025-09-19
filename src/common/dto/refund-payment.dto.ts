import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Refund amount', example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @ApiProperty({
    description: 'Refund reason',
    example: 'Customer requested refund',
  })
  @IsString()
  reason: string;
}
