# Payments Service

Microserviço responsável pelo processamento de pagamentos do marketplace.

## Funcionalidades

- Processamento de pagamentos via gateway externo
- Suporte a múltiplos métodos de pagamento
- Processamento de estornos (refunds)
- Estatísticas de pagamentos
- Integração com gateway de pagamento simulado
- API REST com documentação Swagger

## Tecnologias

- NestJS
- TypeORM
- PostgreSQL
- JWT (JSON Web Tokens)
- Axios (HTTP client)
- Swagger/OpenAPI
- Jest (testes)

## Instalação

```bash
npm install
```

## Configuração

Configure as variáveis de ambiente:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=payments_db
PORT=3004
JWT_SECRET=your-secret-key
PAYMENT_GATEWAY_URL=https://api.stripe.com/v1
PAYMENT_GATEWAY_API_KEY=sk_test_mock_key
NODE_ENV=development
```

## Execução

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run start:prod
```

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## API Endpoints

### Pagamentos

- `POST /payments/process` - Processar pagamento
- `GET /payments/:id` - Buscar pagamento por ID
- `GET /payments/order/:orderId` - Buscar pagamentos por pedido
- `GET /payments/buyer/:buyerId` - Buscar pagamentos por comprador
- `POST /payments/:id/refund` - Processar estorno
- `PATCH /payments/:id/status` - Atualizar status do pagamento
- `GET /payments/stats` - Obter estatísticas de pagamentos

### Documentação

Acesse a documentação Swagger em: `http://localhost:3004/api`

## Estrutura do Projeto

```
src/
├── payments/
│   ├── entities/
│   │   └── payment.entity.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
├── services/
│   └── payment-gateway.service.ts
├── auth/
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── common/
│   └── dto/
│       ├── process-payment.dto.ts
│       └── refund-payment.dto.ts
├── config/
│   └── database.config.ts
├── app.module.ts
└── main.ts
```

## Modelo de Dados

### Payment

- `id`: UUID (chave primária)
- `orderId`: ID do pedido
- `buyerId`: ID do comprador
- `amount`: Valor do pagamento
- `paymentMethod`: Método de pagamento (credit_card/debit_card/pix/boleto/paypal)
- `status`: Status do pagamento (pending/processing/completed/failed/cancelled/refunded)
- `externalPaymentId`: ID do pagamento no gateway externo
- `gatewayResponse`: Resposta do gateway de pagamento
- `errorMessage`: Mensagem de erro (se houver)
- `processingFee`: Taxa de processamento
- `currency`: Moeda (padrão: BRL)
- `description`: Descrição do pagamento
- `refundAmount`: Valor estornado
- `refundReason`: Motivo do estorno
- `processedAt`: Data de processamento
- `failedAt`: Data de falha
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização

## Métodos de Pagamento

- **CREDIT_CARD**: Cartão de crédito
- **DEBIT_CARD**: Cartão de débito
- **PIX**: PIX (pagamento instantâneo)
- **BOLETO**: Boleto bancário
- **PAYPAL**: PayPal

## Status de Pagamentos

- **PENDING**: Pagamento pendente
- **PROCESSING**: Pagamento em processamento
- **COMPLETED**: Pagamento concluído
- **FAILED**: Pagamento falhou
- **CANCELLED**: Pagamento cancelado
- **REFUNDED**: Pagamento estornado

## Gateway de Pagamento

O serviço integra com um gateway de pagamento simulado (Stripe) para processar pagamentos. Para ambiente de desenvolvimento, são utilizados tokens de teste.

### Configuração do Gateway

- **URL**: Configurável via `PAYMENT_GATEWAY_URL`
- **API Key**: Configurável via `PAYMENT_GATEWAY_API_KEY`
- **Métodos suportados**: Cartão de crédito, débito, PIX, boleto, PayPal

### Simulação de Pagamentos

Para testes, o serviço utiliza tokens mock:
- `tok_visa`: Cartão de crédito Visa
- `tok_visa_debit`: Cartão de débito Visa

## Fluxo de Pagamento

1. **Recebimento da Solicitação**: Serviço recebe dados do pagamento
2. **Validação**: Validação dos dados de entrada
3. **Criação do Registro**: Criação do registro de pagamento no banco
4. **Processamento no Gateway**: Envio para o gateway de pagamento
5. **Atualização do Status**: Atualização do status baseado na resposta
6. **Retorno da Resposta**: Retorno do resultado para o cliente

## Estornos (Refunds)

- Suporte a estornos parciais e totais
- Validação de valores disponíveis para estorno
- Rastreamento de motivos de estorno
- Integração com gateway para processamento

## Estatísticas

O serviço fornece estatísticas de pagamentos:
- Total de pagamentos
- Valor total processado
- Pagamentos bem-sucedidos
- Pagamentos falhados
- Pagamentos pendentes

## Autenticação

O serviço utiliza JWT (JSON Web Tokens) para autenticação. Para acessar endpoints protegidos, inclua o token no header:

```
Authorization: Bearer <token>
```

## Tratamento de Erros

- Validação de dados de entrada
- Tratamento de erros do gateway de pagamento
- Logs detalhados para debugging
- Rollback em caso de falha
- Mensagens de erro descritivas

## Segurança

- Validação de tokens JWT
- Sanitização de dados de entrada
- Logs de auditoria
- Proteção contra ataques de força bruta
- Criptografia de dados sensíveis

## Monitoramento

- Logs estruturados
- Métricas de performance
- Alertas de falhas
- Dashboard de estatísticas
- Rastreamento de transações