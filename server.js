require ("dotenv").config();

const express = require ("express");
const cookieParser = require ("cookie-parser");
const path = require ("path");

const authRoutes = require ("./routes/auth");
const financesRoutes = require ("./routes/finances");
const shoppingRoutes = require ("./routes/shopping");
const authMiddleware = require ("./middleware/authMiddleware");

const { initDB } = require("./db");

const app = express();
app.use (express.json ());
app.use (cookieParser ());
app.use (express.static (path.join (__dirname, "public")));

app.use ("/auth", authRoutes);
app.use ("/api/finances", authMiddleware, financesRoutes);
app.use ("/api/shopping", authMiddleware, shoppingRoutes);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await initDB();
        console.log("Database connect and ready");

        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Acesse http://localhost:${PORT}`);
        });
    } catch(err) {
        console.error("Error or connect a database", err);
        process.exit(1);
    }
}

start();