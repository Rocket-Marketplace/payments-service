#!/bin/bash

# Script para iniciar o Payments Service com monitoramento

echo "🚀 Iniciando Payments Service..."

# Verificar se o Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Por favor, inicie o Docker primeiro."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Iniciar monitoramento em background
echo "📊 Iniciando monitoramento..."
docker-compose -f docker-compose.monitoring.yml up -d

# Aguardar serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 10

# Iniciar o serviço
echo "🚀 Iniciando Payments Service..."
npm run start:dev

echo "✅ Payments Service iniciado!"
echo ""
echo "🌐 URLs disponíveis:"
echo "  - Payments Service: http://localhost:3004"
echo "  - Health Check: http://localhost:3004/health"
echo "  - Swagger: http://localhost:3004/api"
echo "  - Grafana: http://localhost:3000 (admin/admin)"
echo "  - Prometheus: http://localhost:9090"
echo "  - Jaeger: http://localhost:16686"