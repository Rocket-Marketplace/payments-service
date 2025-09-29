import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PAYMENTS_DB_HOST || 'payments-db',
  port: parseInt(process.env.PAYMENTS_DB_PORT || '5432', 10),
  username: process.env.PAYMENTS_DB_USERNAME || 'postgres',
  password: process.env.PAYMENTS_DB_PASSWORD || 'postgres',
  database: process.env.PAYMENTS_DB_NAME || 'payments_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
