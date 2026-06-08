const Database = require("better-sqlite3");
const db = new Database("data.db");

db.exec(`
  -- ==========================================
  --             USUÁRIOS
  -- ==========================================
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  -- ==========================================
  --            FINANÇAS
  -- ==========================================
  CREATE TABLE IF NOT EXISTS finances (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INTEGER NOT NULL,
    name     TEXT NOT NULL,
    value    REAL NOT NULL,
    category TEXT NOT NULL,
    type     TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    date     TEXT NOT NULL DEFAULT (date('now')),

    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- ==========================================
  --         CATÁLOGO DE PRODUTOS
  -- ==========================================
  CREATE TABLE IF NOT EXISTS products (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL
  );

  -- ==========================================
  --            LISTA BASE MÊS
  -- ==========================================
  CREATE TABLE IF NOT EXISTS shopping_base (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    base_qty   INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, product_id),

    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  -- ==========================================
  --           CARRINHO MÊS ATUAL
  -- ==========================================
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
  );

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
  { name: "farinha",          category: "Básicos" },
  { name: "sardinha",      category: "Básicos" },
  { name: "maionese",      category: "Básicos" },
  { name: "ketchup",       category: "Básicos" },
  { name: "mostarda",      category: "Básicos" },
  // PT:              Breakfast
  { name: "cafe",           category: "Café da manhã" },
  { name: "cha",            category: "Café da manhã" },
  { name: "achocolatado",   category: "Café da manhã" },
  { name: "leite",          category: "Café da manhã" },
  { name: "leitecondensado",category: "Café da manhã" },
  { name: "cremedeleite",   category: "Café da manhã" },
  { name: "manteiga",       category: "Café da manhã" },
  { name: "danone",      category: "Café da manhã" },
  { name: "requeijao",      category: "Café da manhã" },
  { name: "queijo",         category: "Café da manhã" },
  { name: "presunto",       category: "Café da manhã" },
  // PT:              Cookies
  { name: "bolachamaizena",  category: "Biscoitos" },
  { name: "creamcrack",      category: "Biscoitos" },
  { name: "bolacharecheada", category: "Biscoitos" },
  { name: "wafer",           category: "Biscoitos" },
  { name: "torrada",         category: "Biscoitos" },
  // PT:              Bakery
  { name: "paoforma",   category: "Padaria" },
  { name: "paofrances", category: "Padaria" },
  { name: "bolo",       category: "Padaria" },
  // PT:             Produce
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
  // PT:             Meats
  { name: "frango",      category: "Carnes" },
  { name: "carnebovina", category: "Carnes" },
  { name: "carnesuina",  category: "Carnes" },
  { name: "linguica",    category: "Carnes" },
  { name: "peixe",       category: "Carnes" },
  { name: "ovos",        category: "Carnes" },
  //                Drinks
  { name: "agua",         category: "Bebidas" },
  { name: "refrigerante", category: "Bebidas" },
  { name: "suco",         category: "Bebidas" },
  { name: "energetico",   category: "Bebidas" },
  //               Cleaning
  { name: "qboa",        category: "Limpeza" },
  { name: "desinfetante",category: "Limpeza" },
  { name: "detergente",  category: "Limpeza" },
  { name: "sabaoempo",   category: "Limpeza" },
  { name: "amaciante",   category: "Limpeza" },
  { name: "limpador",    category: "Limpeza" },
  { name: "esponja",     category: "Limpeza" },
  { name: "alcool",      category: "Limpeza" },
  //                Hygiene
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
  //            Frozen and extras
  { name: "pizza",       category: "Extras" },
  { name: "hamburguer",  category: "Extras" },
  { name: "batatafrita", category: "Extras" },
  { name: "sorvete",     category: "Extras" },
  { name: "chocolate",   category: "Extras" },
  { name: "bala",        category: "Extras" },
  { name: "pipoca",      category: "Extras" }
];

const total = db.prepare("SELECT COUNT(*) as count FROM products").get();
if (total.count === 0) {
  const insert = db.prepare(
    "INSERT INTO products (name, category)VALUES (?,?)"
  );

  const seedAll = db.transaction(() => {
    for (const produto of PRODUTOS) {
      insert.run(produto.name, produto.category);
    }
});

seedAll();
console.log(`Catálogo populado com ${PRODUTOS.length} produtos`);
}

module.exports = db;