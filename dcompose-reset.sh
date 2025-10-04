#!/bin/bash
set -e

echo "⏹️  Parando containers..."
docker compose down -v --remove-orphans

#echo "🧹 Limpando imagens antigas..."
#docker system prune -af

echo "🔨 Rebuild forçado..."
docker compose build --no-cache

echo "🚀 Subindo containers..."
docker compose up -d --remove-orphans

echo "✅ Containers rodando:"
docker ps

