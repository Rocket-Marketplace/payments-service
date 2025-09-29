# 💳 Payments Service

Serviço responsável pelo processamento de pagamentos, gerenciamento de transações financeiras e integração com gateways de pagamento no marketplace. Este serviço garante a segurança e confiabilidade de todas as operações financeiras.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Execução](#execução)
- [Docker](#docker)
- [API Endpoints](#api-endpoints)
- [Contratos de Dados](#contratos-de-dados)
- [Monitoramento](#monitoramento)
- [Testes](#testes)
- [Deploy](#deploy)

## 🎯 Visão Geral

O Payments Service é responsável por:

- **Processamento de Pagamentos**: Criação e processamento de transações
- **Gestão de Status**: Controle de status de pagamentos (pending, completed, failed, refunded)
- **Reembolsos**: Processamento de estornos e cancelamentos
- **Estatísticas**: Relatórios e métricas de pagamentos
- **Eventos Assíncronos**: Comunicação via RabbitMQ para processamento de pagamentos
- **Auditoria**: Rastreamento completo de todas as transações

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│ Checkout Service│    │ Messaging Service│
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          └──────────────────────┼──────────────────────┐
                                 │                      │
                    ┌─────────────▼─────────────┐      │
                    │     Payments Service      │      │
                    │  ┌─────────────────────┐  │      │
                    │  │  Payment Processing │  │      │
                    │  │  Status Management  │  │      │
                    │  │  Refund Processing  │  │      │
                    │  │  Statistics & Reports│  │      │
                    │  └─────────────────────┘  │      │
                    └─────────────┬─────────────┘      │
                                  │                    │
                    ┌─────────────▼─────────────┐      │
                    │     Payment Gateway       │      │
                    │    (Stripe, PayPal, etc)  │      │
                    └───────────────────────────┘      │
                                                       │
                    ┌──────────────────────────────────▼─────────────┐
                    │              RabbitMQ                          │
                    │         Payment Queue Consumer                 │
                    └────────────────────────────────────────────────┘
```

## ⚡ Funcionalidades

### 💰 Processamento de Pagamentos
- Criação de transações de pagamento
- Validação de dados de pagamento
- Integração com gateways de pagamento
- Processamento assíncrono via RabbitMQ
- Controle de status em tempo real

### 🔄 Gestão de Status
- **PENDING**: Pagamento aguardando processamento
- **COMPLETED**: Pagamento processado com sucesso
- **FAILED**: Pagamento falhou
- **REFUNDED**: Pagamento estornado
- **CANCELLED**: Pagamento cancelado

### 💸 Reembolsos
- Processamento de estornos parciais e totais
- Validação de elegibilidade para reembolso
- Rastreamento de reembolsos
- Notificações de status

### 📊 Relatórios e Estatísticas
- Estatísticas de pagamentos por período
- Relatórios de transações
- Métricas de performance
- Análise de falhas

### 🔐 Segurança
- Validação de dados sensíveis
- Criptografia de informações de pagamento
- Auditoria de transações
- Compliance com PCI DSS

## 🛠️ Tecnologias

- **Framework**: NestJS 11.x
- **Linguagem**: TypeScript 5.x
- **Banco de Dados**: PostgreSQL 15
- **ORM**: TypeORM
- **Autenticação**: JWT + Passport
- **Validação**: class-validator + class-transformer
- **Documentação**: Swagger/OpenAPI
- **Monitoramento**: Prometheus + Grafana
- **Tracing**: OpenTelemetry + Jaeger
- **Mensageria**: RabbitMQ (amqplib)
- **Containerização**: Docker + Docker Compose

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- PostgreSQL 15
- Docker e Docker Compose (opcional)
- RabbitMQ (para eventos)

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd payments-service
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
PORT=3004
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=payments_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Serviços Externos
MESSAGING_SERVICE_URL=http://localhost:3005

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE_PAYMENTS=payment_queue
RABBITMQ_QUEUE_ORDERS=order_queue

# Payment Gateway (exemplo com Stripe)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Monitoramento
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_PORT=9090
```

### Configuração do Banco de Dados

1. **Crie o banco de dados**
```sql
CREATE DATABASE payments_db;
```

2. **Execute as migrações**
```bash
npm run migration:run
```

## 🏃‍♂️ Execução

### Desenvolvimento

```bash
# Modo desenvolvimento com hot reload
npm run start:dev

# Modo debug
npm run start:debug

# Build e execução
npm run build
npm run start:prod
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev          # Inicia com watch mode
npm run start:debug        # Inicia em modo debug

# Build
npm run build              # Compila TypeScript
npm run start:prod         # Executa versão compilada

# Testes
npm run test               # Executa testes unitários
npm run test:watch         # Executa testes em watch mode
npm run test:cov           # Executa testes com coverage
npm run test:e2e           # Executa testes end-to-end

# Qualidade de Código
npm run lint               # Executa ESLint
npm run format             # Formata código com Prettier
```

## 🐳 Docker

### Docker Compose (Recomendado)

```bash
# Inicia todos os serviços
docker-compose up -d

# Inicia apenas o serviço
docker-compose up payments-service

# Para os serviços
docker-compose down

# Rebuild da imagem
docker-compose up --build
```

### Docker Manual

```bash
# Build da imagem
docker build -t payments-service .

# Executa o container
docker run -p 3004:3004 \
  -e DB_HOST=host.docker.internal \
  -e MESSAGING_SERVICE_URL=http://host.docker.internal:3005 \
  payments-service
```

### Serviços Incluídos no Docker Compose

- **payments-service**: Aplicação principal (porta 3004)
- **payments-db**: PostgreSQL (porta 5435)
- **Prometheus**: Monitoramento (porta 9090)
- **Grafana**: Dashboards (porta 3000)

## 📡 API Endpoints

### 💳 Pagamentos

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/payments/process` | Processa um pagamento | ❌ |
| GET | `/payments/stats` | Obtém estatísticas de pagamentos | ❌ |
| GET | `/payments/order/:orderId` | Obtém pagamentos por pedido | ❌ |
| GET | `/payments/buyer/:buyerId` | Obtém pagamentos por comprador | ❌ |
| GET | `/payments/:id` | Obtém pagamento por ID | ❌ |
| POST | `/payments/:id/refund` | Processa reembolso | ❌ |
| PATCH | `/payments/:id/status` | Atualiza status do pagamento | ❌ |

### 🧪 Testes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/payments/test-consumer` | Testa consumer RabbitMQ |

### 🏥 Health Check

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status da aplicação |
| GET | `/health/ready` | Readiness probe |
| GET | `/health/live` | Liveness probe |

## 📊 Contratos de Dados

### ProcessPaymentDto
```typescript
{
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDetails: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
}
```

### RefundPaymentDto
```typescript
{
  amount?: number; // Se não especificado, reembolso total
  reason: string;
}
```

### Payment Entity
```typescript
{
  id: string;
  orderId: string;
  buyerId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  gatewayResponse?: any;
  refundedAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### PaymentStatus Enum
```typescript
enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}
```

### Payment Statistics
```typescript
{
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  refundedPayments: number;
  averageAmount: number;
  paymentsByStatus: {
    [key in PaymentStatus]: number;
  };
  paymentsByMethod: {
    [method: string]: number;
  };
}
```

## 📈 Monitoramento

### Métricas Prometheus

- `payments_total`: Total de pagamentos processados
- `payments_amount_total`: Valor total processado
- `payments_by_status`: Pagamentos por status
- `payments_processing_duration_seconds`: Tempo de processamento
- `refunds_total`: Total de reembolsos
- `payment_failures_total`: Total de falhas

### Dashboards Grafana

Acesse: `http://localhost:3000`

- **Payments Dashboard**: Métricas de pagamentos
- **Financial Metrics**: Métricas financeiras
- **Error Tracking**: Rastreamento de erros

### Tracing Jaeger

Acesse: `http://localhost:16686`

- Traces de processamento de pagamentos
- Performance analysis
- Dependency mapping

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes end-to-end
npm run test:e2e

# Testes em watch mode
npm run test:watch
```

### Estrutura de Testes

```
test/
├── app.e2e-spec.ts          # Testes E2E
├── jest-e2e.json           # Configuração Jest E2E
src/
├── **/*.spec.ts            # Testes unitários
└── **/*.controller.spec.ts # Testes de controllers
```

### Testes de Integração

```bash
# Testa integração com RabbitMQ
curl -X POST http://localhost:3004/payments/test-consumer

# Testa processamento de pagamento
curl -X POST http://localhost:3004/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-123",
    "buyerId": "user-456",
    "amount": 100.00,
    "currency": "BRL",
    "paymentMethod": "credit_card",
    "paymentDetails": {
      "cardNumber": "4111111111111111",
      "expiryDate": "12/25",
      "cvv": "123",
      "cardholderName": "John Doe"
    }
  }'
```

## 🚀 Deploy

### Script de Deploy

```bash
# Executa o script de deploy
./deploy.sh
```

### Deploy Manual

```bash
# Build da aplicação
npm run build

# Executa migrações
npm run migration:run

# Inicia em produção
npm run start:prod
```

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=3004
DB_HOST=your-production-db-host
JWT_SECRET=your-production-secret
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
MESSAGING_SERVICE_URL=https://messaging.yourdomain.com
```

## 🔧 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `.env`

2. **Falha no processamento de pagamento**
   - Verifique as chaves do gateway de pagamento
   - Confirme se o webhook está configurado

3. **Consumer RabbitMQ não funciona**
   - Verifique se o RabbitMQ está rodando
   - Confirme a URL de conexão

4. **Erro de validação de dados**
   - Verifique os dados de entrada
   - Confirme se os DTOs estão corretos

### Logs

```bash
# Logs da aplicação
docker-compose logs -f payments-service

# Logs do banco
docker-compose logs -f payments-db

# Logs do RabbitMQ
docker-compose logs -f rabbitmq
```

## 🔐 Segurança

### Boas Práticas

1. **Nunca armazene dados sensíveis**
   - Use tokens de gateway
   - Criptografe dados sensíveis

2. **Validação rigorosa**
   - Valide todos os dados de entrada
   - Use DTOs com class-validator

3. **Auditoria completa**
   - Registre todas as transações
   - Mantenha logs de auditoria

4. **Compliance PCI DSS**
   - Não armazene dados de cartão
   - Use gateways certificados

## 📚 Documentação Adicional

- [Swagger UI](http://localhost:3004/api) - Documentação interativa da API
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para o Marketplace API**