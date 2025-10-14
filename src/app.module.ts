import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
import { databaseConfig } from './config/database.config';
import { PaymentsModule } from './payments/payments.module';
import { PaymentModule } from './payment/payment.module';
import { EventsModule } from './events/events.module';
import { HealthModule } from './health/health.module';
import { MessagingModule } from './messaging/messaging.module';
// import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    // PassportModule,
    // JwtModule.register({
    //   secret: process.env.JWT_SECRET || 'your-secret-key',
    //   signOptions: { expiresIn: '24h' },
    // }),
    PaymentsModule,
    PaymentModule,
    EventsModule,
    HealthModule,
    MessagingModule,
  ],
  // providers: [JwtStrategy],
})
export class AppModule {}
