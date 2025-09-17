// ./mongo/init-replica.js
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function initializeReplica() {
    print("=== INICIALIZAÇÃO DO REPLICASET ===");

    // Aguarda o MongoDB estar pronto
    print("⏳ Aguardando MongoDB inicializar...");
    await sleep(10000);

    try {
        const status = rs.status();
        print("✅ Replicaset já inicializado");
        return;
    } catch (error) {
        if (error.codeName === 'NotYetInitialized' || error.message.includes('not running with --replSet')) {
            print("🚀 Inicializando replicaset...");

            // Pegando nome do replicaset via env ou default rs0
            const replicaSetName = typeof process !== "undefined" && process.env.MONGO_REPLICA_SET
                ? process.env.MONGO_REPLICA_SET
                : "rs0";

            const config = {
                _id: replicaSetName,
                members: [
                    { _id: 0, host: "mongo1:27017", priority: 2 },
                    { _id: 1, host: "mongo2:27017", priority: 1 },
                    { _id: 2, host: "mongo3:27017", priority: 1 }
                ]
            };

            try {
                rs.initiate(config);
                print("✅ Replicaset iniciado");
            } catch (initError) {
                print("⚠️ Erro ao iniciar replicaset (talvez já iniciado):");
                printjson(initError);
            }

            // Aguarda estabilização
            print("⏳ Aguardando eleição...");
            await sleep(15000);

            // Cria usuário admin se não existir
            print("👤 Verificando usuário admin...");
            try {
                const users = db.getSiblingDB("admin").getUsers();
                const adminExists = users.some(u => u.user === "admin");

                if (!adminExists) {
                    db.getSiblingDB("admin").createUser({
                        user: "admin",
                        pwd: "password",
                        roles: [
                            { role: "root", db: "admin" },
                            { role: "clusterAdmin", db: "admin" }
                        ]
                    });
                    print("✅ Usuário admin criado");
                } else {
                    print("ℹ️ Usuário admin já existe");
                }
            } catch (userError) {
                print("⚠️ Erro ao verificar/ criar usuário:");
                printjson(userError);
            }

        } else {
            print("❌ Erro ao verificar replicaset:");
            printjson(error);
        }
    }
}

initializeReplica();
