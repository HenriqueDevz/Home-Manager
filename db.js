const { createClient } = require("@libsql/client");
const db = createClient ({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS finances (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id  INTEGER NOT NULL,
      name     TEXT NOT NULL,
      value    REAL NOT NULL,
      category TEXT NOT NULL,
      type     TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      date     TEXT NOT NULL DEFAULT (date('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS shopping_base (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      base_qty   INTEGER NOT NULL DEFAULT 1,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id)    REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS shopping_monthly (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty        INTEGER NOT NULL DEFAULT 0,
      month      INTEGER NOT NULL,
      year       INTEGER NOT NULL,
      UNIQUE(user_id, product_id, month, year),
      FOREIGN KEY (user_id)    REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
  
  const PRODUTOS = [
    { name: "arroz",         category: "Básicos" },
    { name: "feijao",        category: "Básicos" },
    { name: "acucar",        category: "Básicos" },
    { name: "sal",           category: "Básicos" },
    { name: "trigo",         category: "Básicos" },
    { name: "macarrao",      category: "Básicos" },
    { name: "oleo",          category: "Básicos" },
    { name: "molhotomate",   category: "Básicos" },
    { name: "extratotomate", category: "Básicos" },
    { name: "milho",         category: "Básicos" },
    { name: "ervilha",       category: "Básicos" },
    { name: "azeitona",      category: "Básicos" },
    { name: "maizena",       category: "Básicos" },
    { name: "farinha",       category: "Básicos" },
    { name: "sardinha",      category: "Básicos" },
    { name: "maionese",      category: "Básicos" },
    { name: "ketchup",       category: "Básicos" },
    { name: "mostarda",      category: "Básicos" },
    { name: "cafe",            category: "Café da manhã" },
    { name: "cha",             category: "Café da manhã" },
    { name: "achocolatado",    category: "Café da manhã" },
    { name: "leite",           category: "Café da manhã" },
    { name: "leitecondensado", category: "Café da manhã" },
    { name: "cremedeleite",    category: "Café da manhã" },
    { name: "manteiga",        category: "Café da manhã" },
    { name: "danone",          category: "Café da manhã" },
    { name: "requeijao",       category: "Café da manhã" },
    { name: "queijo",          category: "Café da manhã" },
    { name: "presunto",        category: "Café da manhã" },
    { name: "bolachamaizena",  category: "Biscoitos" },
    { name: "creamcrack",      category: "Biscoitos" },
    { name: "bolacharecheada", category: "Biscoitos" },
    { name: "wafer",           category: "Biscoitos" },
    { name: "torrada",         category: "Biscoitos" },
    { name: "paoforma",   category: "Padaria" },
    { name: "paofrances", category: "Padaria" },
    { name: "bolo",       category: "Padaria" },
    { name: "banana",   category: "Hortifruti" },
    { name: "maca",     category: "Hortifruti" },
    { name: "laranja",  category: "Hortifruti" },
    { name: "mamao",    category: "Hortifruti" },
    { name: "abacaxi",  category: "Hortifruti" },
    { name: "uva",      category: "Hortifruti" },
    { name: "melancia", category: "Hortifruti" },
    { name: "tomate",   category: "Hortifruti" },
    { name: "cebola",   category: "Hortifruti" },
    { name: "alho",     category: "Hortifruti" },
    { name: "batata",   category: "Hortifruti" },
    { name: "cenoura",  category: "Hortifruti" },
    { name: "pepino",   category: "Hortifruti" },
    { name: "alface",   category: "Hortifruti" },
    { name: "couve",    category: "Hortifruti" },
    { name: "brocolis", category: "Hortifruti" },
    { name: "frango",      category: "Carnes" },
    { name: "carnebovina", category: "Carnes" },
    { name: "sasami",  category: "Carnes" },
    { name: "linguica",    category: "Carnes" },
    { name: "peixe",       category: "Carnes" },
    { name: "ovos",        category: "Carnes" },
    { name: "agua",         category: "Bebidas" },
    { name: "refrigerante", category: "Bebidas" },
    { name: "suco",         category: "Bebidas" },
    { name: "energetico",   category: "Bebidas" },
    { name: "qboa",         category: "Limpeza" },
    { name: "desinfetante", category: "Limpeza" },
    { name: "detergente",   category: "Limpeza" },
    { name: "sabaoempo",    category: "Limpeza" },
    { name: "amaciante",    category: "Limpeza" },
    { name: "limpador",     category: "Limpeza" },
    { name: "esponja",      category: "Limpeza" },
    { name: "alcool",       category: "Limpeza" },
    { name: "papelhigienico", category: "Higiene" },
    { name: "papeltoalha",    category: "Higiene" },
    { name: "guardanapo",     category: "Higiene" },
    { name: "sabonete",       category: "Higiene" },
    { name: "shampoo",        category: "Higiene" },
    { name: "condicionador",  category: "Higiene" },
    { name: "cremedental",    category: "Higiene" },
    { name: "escovadental",   category: "Higiene" },
    { name: "lençoumido",     category: "Higiene" },
    { name: "absorvente",     category: "Higiene" },
    { name: "pizza",       category: "Extras" },
    { name: "hamburguer",  category: "Extras" },
    { name: "batatafrita", category: "Extras" },
    { name: "sorvete",     category: "Extras" },
    { name: "chocolate",   category: "Extras" },
    { name: "bala",        category: "Extras" },
    { name: "pipoca",      category: "Extras" }
  ];

  const totalResult = await db.execute("SELECT COUNT(*)as count FROM products");
  const total = totalResult.rows[0].count;
  if (total === 0) {
    for (const produto of PRODUTOS) {
      await db.execute({
        sql: "INSERT INTO products (name, category) VALUES (?, ?)",
        args: [produto.name, produto.category]
      });
    }
    console.log(`Catálogo populado com ${PRODUTOS.length} produtos`);
  }
}

module.exports = { db, initDB };
