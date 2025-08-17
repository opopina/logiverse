#!/bin/bash

# LogiVerse Database Setup Script
echo "🦊 LogiVerse - Database Setup"
echo "==============================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Por favor instálalo primero."
    exit 1
fi

echo "✅ Docker y Docker Compose encontrados"
echo ""

# Parar contenedores existentes
echo "🔄 Deteniendo contenedores existentes..."
docker-compose down

echo ""
echo "🚀 Iniciando PostgreSQL y Redis..."

# Iniciar solo PostgreSQL y Redis
docker-compose up -d postgres redis

echo ""
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 10

# Verificar conexión a PostgreSQL
echo "🔍 Verificando conexión a PostgreSQL..."
docker exec logiverse-postgres pg_isready -U logiverse -d logiverse

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL está funcionando correctamente"
else
    echo "❌ Error conectando a PostgreSQL"
    exit 1
fi

echo ""
echo "📋 Aplicando migraciones de Prisma..."

# Navegar al directorio del backend
cd packages/backend/api-gateway

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "🗃️ Ejecutando migraciones..."
npx prisma db push

# Seed de datos iniciales (opcional)
echo "🌱 Aplicando datos iniciales..."
# npx prisma db seed

echo ""
echo "🎉 ¡Base de datos configurada exitosamente!"
echo ""
echo "📊 Información de conexión:"
echo "   Host: localhost"
echo "   Puerto: 5432"
echo "   Usuario: logiverse"
echo "   Contraseña: logiverse"
echo "   Base de datos: logiverse"
echo ""
echo "🌐 pgAdmin disponible en: http://localhost:8080"
echo "   Email: admin@logiverse.com"
echo "   Contraseña: logiverse123"
echo ""
echo "🦊 ¡LogiVerse database ready!"
