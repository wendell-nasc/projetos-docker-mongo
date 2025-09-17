# Gerar o keyFile
mkdir -p mongo
openssl rand -base64 756 > mongo/mongo-keyfile
chmod 400 mongo/mongo-keyfile
docker-compose --env-file .env up 



# HOSTS

sudo nano /etc/hosts

127.0.0.1   mongo1
127.0.0.1   mongo2  
127.0.0.1   mongo3


# rodar
rs.initiate({
            _id: "rs0",
            members: [
                { _id: 0, host: "mongo1:27017" },
                { _id: 1, host: "mongo2:27017" },
                { _id: 2, host: "mongo3:27017" }
            ]
        })

# logs
# Verifique os logs do mongo1 para ver se o script rodou
docker-compose logs mongo1 | grep -i "replicaset\|initiate\|inicializando"

# Execute o script manualmente se necessário
docker exec -it mongo1 mongosh /docker-entrypoint-initdb.d/init-replica.js




# 1. Inicialize o replicaset manualmente:
bash
docker exec -it mongo1 mongosh --eval "
try {
    // Tenta verificar se já está inicializado
    const status = rs.status();
    print('✅ Replicaset já está inicializado:');
    printjson(status);
} catch (error) {
    if (error.codeName === 'NotYetInitialized') {
        print('⏳ Inicializando replicaset...');
        
        const config = {
            _id: 'rs0',
            members: [
                {_id: 0, host: 'mongo1:27017', priority: 2},
                {_id: 1, host: 'mongo2:27017', priority: 1},
                {_id: 2, host: 'mongo3:27017', priority: 1}
            ]
        };
        
        rs.initiate(config);
        print('✅ Replicaset iniciado!');
        
        // Aguarda um pouco
        sleep(5000);
        
        // Verifica o status
        const newStatus = rs.status();
        const primary = newStatus.members.find(m => m.stateStr === 'PRIMARY');
        print('🎉 Primary eleito: ' + (primary ? primary.name : 'Nenhum'));
        
    } else {
        print('❌ Erro ao verificar status:');
        printjson(error);
    }
}
"


# 2. Crie o usuário administrativo:
bash
docker exec -it mongo1 mongosh --eval "
use admin

try {
    db.createUser({
        user: 'admin',
        pwd: 'password',
        roles: [
            { role: 'root', db: 'admin' },
            { role: 'clusterAdmin', db: 'admin' }
        ]
    });
    print('✅ Usuário admin criado com sucesso');
} catch (error) {
    if (error.codeName === 'DuplicateKey') {
        print('ℹ️ Usuário admin já existe');
    } else {
        print('❌ Erro ao criar usuário:');
        printjson(error);
    }
}
"


# 3. Verifique o status do replicaset:
bash
docker exec -it mongo1 mongosh --eval "rs.status()"