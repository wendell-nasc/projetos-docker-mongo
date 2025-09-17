#!/bin/bash
set -e

echo "🚀 Custom entrypoint iniciado..."

KEYFILE="/etc/mongo/mongo-keyfile"
if [ -f "$KEYFILE" ]; then
    chmod 400 "$KEYFILE"
 
fi

# Chama entrypoint oficial passando o CMD
exec /usr/local/bin/docker-entrypoint.sh "$@"
