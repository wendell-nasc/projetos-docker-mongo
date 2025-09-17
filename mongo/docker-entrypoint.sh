#!/bin/bash
set -e

# Configurações padrão
REPLICA_SET=${MONGO_REPLICA_SET:-rs0}

PORT=${MONGO_PORT1:-27017}

# Constrói o comando SEM keyfile temporariamente
CMD="mongod --replSet $REPLICA_SET --bind_ip_all --port $PORT --keyFile /etc/mongo/mongo-keyfile "

# Use o path correto do volume
if [ -f /etc/mongo/keyfile ]; then
    CMD="$CMD --keyFile /etc/mongo/mongo-keyfile "
    # Ajusta permissões do arquivo montado
    chmod 400 /etc/mongo/mongo-keyfile 
    # chown mongodb:mongodb /etc/mongo/keyfile
fi

echo "🚀 Iniciando MongoDB: $CMD"
exec $CMD