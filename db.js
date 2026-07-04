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
    { name: "ARROZ",         category: "Básicos" },
    { name: "FEIJÃO",       category: "Básicos" },
    { name: "AÇÚCAR",        category: "Básicos" },
    { name: "SAL",           category: "Básicos" },
    { name: "TRIGO",         category: "Básicos" },
    { name: "MACARRÃO",      category: "Básicos" },
    { name: "OLEO",          category: "Básicos" },
    { name: "MOLHO DE TOMATE",   category: "Básicos" },
    { name: "EXTRATO DE TOMATE", category: "Básicos" },
    { name: "MILHO",         category: "Básicos" },
    { name: "ERVILHA",       category: "Básicos" },
    { name: "AZEITONA",      category: "Básicos" },
    { name: "MAIZENA",       category: "Básicos" },
    { name: "FARINHA",       category: "Básicos" },
    { name: "SARDINHA",      category: "Básicos" },
    { name: "MAIONESE",      category: "Básicos" },
    { name: "AZEITE",      category: "Básicos" },
    { name: "KETCHUP",       category: "Básicos" },
    { name: "MOSTARDA",      category: "Básicos" },
    { name: "PARMESÃO",      category: "Básicos" },
    { name: "LEITE EM PÓ",      category: "Básicos" },
    { name: "CAFÉ",            category: "Café da manhã" },
    { name: "CHÁ",             category: "Café da manhã" },
    { name: "ACHOCOLATADO",    category: "Café da manhã" },
    { name: "CAFÉ SOLUVEL",    category: "Café da manhã" },
    { name: "LEITE",           category: "Café da manhã" },
    { name: "LEITE CONDENSADO", category: "Café da manhã" },
    { name: "CREME DE LEITE",    category: "Café da manhã" },
    { name: "MANTEIGA",        category: "Café da manhã" },
    { name: "DANONE",          category: "Café da manhã" },
    { name: "REQUEIJÃO",       category: "Café da manhã" },
    { name: "QUEIJO",          category: "Café da manhã" },
    { name: "PRESUNTO",        category: "Café da manhã" },
    { name: "BOLACHA MAIZENA",  category: "Biscoitos" },
    { name: "CREAM CRACK",      category: "Biscoitos" },
    { name: "BOLACHA RECHEADA", category: "Biscoitos" },
    { name: "WAFER",           category: "Biscoitos" },
    { name: "TORRADA",         category: "Biscoitos" },
    { name: "PÃO DE FORMA",   category: "Padaria" },
    { name: "PÃO FRANCES", category: "Padaria" },
    { name: "BOLO",       category: "Padaria" },
    { name: "BANANA",   category: "Hortifruti" },
    { name: "MACA",     category: "Hortifruti" },
    { name: "LARANJA",  category: "Hortifruti" },
    { name: "MAMÃO",    category: "Hortifruti" },
    { name: "ABACAXI",  category: "Hortifruti" },
    { name: "UVA",      category: "Hortifruti" },
    { name: "MELANCIA", category: "Hortifruti" },
    { name: "TOMATE",   category: "Hortifruti" },
    { name: "CEBOLA",   category: "Hortifruti" },
    { name: "ALHO",     category: "Hortifruti" },
    { name: "BATATA",   category: "Hortifruti" },
    { name: "CENOURA",  category: "Hortifruti" },
    { name: "PEPINO",   category: "Hortifruti" },
    { name: "ALFACE",   category: "Hortifruti" },
    { name: "COUVE",    category: "Hortifruti" },
    { name: "BROCOLIS", category: "Hortifruti" },
    { name: "FRANGO",      category: "Carnes" },
    { name: "CARNE BOVINA", category: "Carnes" },
    { name: "SASAMI",  category: "Carnes" },
    { name: "LINGUIÇA",    category: "Carnes" },
    { name: "PEIXE",       category: "Carnes" },
    { name: "OVOS",        category: "Carnes" },
    { name: "AGUA",         category: "Bebidas" },
    { name: "REFRIGERANTE", category: "Bebidas" },
    { name: "SUCO",         category: "Bebidas" },
    { name: "ENERGETICO",   category: "Bebidas" },
    { name: "QBOA",         category: "Limpeza" },
    { name: "DESINFETANTE", category: "Limpeza" },
    { name: "DETERGENTE",   category: "Limpeza" },
    { name: "SABÃO EM PÓ",    category: "Limpeza" },
    { name: "AMACIANTE",    category: "Limpeza" },
    { name: "LIMPADOR",     category: "Limpeza" },
    { name: "ESPONJA",      category: "Limpeza" },
    { name: "ALCOOL",       category: "Limpeza" },
    { name: "PAPEL HIGIENICO", category: "Higiene" },
    { name: "PAPEL TOALHA",    category: "Higiene" },
    { name: "GUARDANAPO",     category: "Higiene" },
    { name: "SABONETE",       category: "Higiene" },
    { name: "SHAMPOO",        category: "Higiene" },
    { name: "CONDICIONADOR",  category: "Higiene" },
    { name: "CREME DENTAL",    category: "Higiene" },
    { name: "ESCOVA DENTAL",   category: "Higiene" },
    { name: "FRAUDA",     category: "Higiene" },
    { name: "ABSORVENTE",     category: "Higiene" },
    { name: "PIZZA",       category: "Extras" },
    { name: "STEAK FRANGO",  category: "Extras" },
    { name: "SALGADINHO", category: "Extras" },
    { name: "SORVETE",     category: "Extras" },
    { name: "CHOCOLATE",   category: "Extras" },
    { name: "DANONINHO",        category: "Extras" },
    { name: "PIPOCA",      category: "Extras" }
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
