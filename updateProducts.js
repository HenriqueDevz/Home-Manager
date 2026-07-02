require("dotenv").config();
const { db } = require("./db");

async function update() {
    await db.execute("UPDATE products SET name = UPPER(name)");
    console.log("Nomes atualizados!");
    process.exit(0);
}
update();