FROM mongo:6.0

# Keyfile
COPY mongo-keyfile /etc/mongo/mongo-keyfile
RUN chmod 400 /etc/mongo/mongo-keyfile && chown mongodb:mongodb /etc/mongo/mongo-keyfile

# Script de inicialização
COPY init-replica.js /docker-entrypoint-initdb.d/

# Wrapper
COPY custom-entrypoint.sh /usr/local/bin/custom-entrypoint.sh
RUN chmod 755 /usr/local/bin/custom-entrypoint.sh

EXPOSE 27017

# EntryPoint
ENTRYPOINT ["/usr/local/bin/custom-entrypoint.sh"]

# CMD padrão: garante replicaset + keyFile + bind
CMD ["mongod", "--replSet", "rs0", "--keyFile", "/etc/mongo/mongo-keyfile", "--bind_ip_all"]
