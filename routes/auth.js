const express = require ("express");
const bcrypt = require ("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require ("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({error: "Preencha todos os campos" });
    }
    try {
        const hash = bcrypt.hashSync(password, 10);
        await db.execute({
            sql: "INSERT INTO users (username, password) VALUES  (?, ?)",
            args: [username, hash]
        });
        res.status(201).json({message: "Usuário criado" });
     } catch (err) {
        res.status(409).json({error: "Usuário ja existe" });
     }
});

router.post("/login" , async (req , res) => {
    const { username, password } = req.body;
    const result = await db.execute({
        sql: "SELECT * FROM users WHERE username = ?",
        args: [username]
    });
    const user = result.rows[0];
    if (!user) {
        return res.status(401).json({error: "Credenciais inválidas" });
    }
    const senhaCorreta = bcrypt.compareSync(password, user.password);
    if (!senhaCorreta) {
        return res.status(401).json({error : "Credenciais inválidas" });
    }
    const token = jwt.sign(
        {id: user.id , username: user.username },
        process.env.JWT_SECRET,
        {expiresIn: "7d" }
     );
    res.cookie("token", token, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ message: "Login realizado", username: user.username });
});

router.post("/logout", (req , res) => {
    res.clearCookie("token");
    res.json({ message: "Logout realizado" });
});

module.exports = router;