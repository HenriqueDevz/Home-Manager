require("dotenv").config();
const { db } = require("./db");

async function addColumn() {
    try {
        await db.execute("ALTER TABLE shopping_monthly ADD COLUMN price REAL DEFAULT 0");
        console.log("✅ Coluna price adicionada!");
        process.exit(O);
    } catch(err) {
        console.error("Erro:", err);
        process.exit(1);
    }
}

addColumn();