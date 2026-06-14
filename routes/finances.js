const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
    const userId = req.user.id;

    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();


    const items = db
    .prepare(`
        SELECT * FROM finances
        WHERE user_id = ?
            AND strftime('%m-%Y', date) = ?
        ORDER BY date DESC
    `).all(userId, `${String(month).padStart(2, '0')}-${year}`);

    const ganhos = items.filter(i => i.type === "income");
    const gastos = items.filter(i => i.type === "expense");

    const totalGanhos = ganhos.reduce((acc, i)=> acc + i.value, 0);
    const totalGastos = gastos.reduce ((acc, i)=> acc + i.value, 0);

    res.json({
        items,
        ganhos,
        gastos,
        totalGanhos,
        totalGastos,
        saldo: totalGanhos - totalGastos,
        month,
        year
    });
});


router.post("/", (req, res) => {
    const userId = req.user.id;
    const {name, value, category, type, date } = req.body;
    
    if (!name || !value || !category || !type) {
        return res.status(400).json({error: "Campos obrigatórios faltando "});
    }
    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({error: "Tipo inválido "});
    }
    const dataFinal = date || new Date().toISOString().split('T')[0];
    const stmt = db.prepare(`
        INSERT INTO finances (user_id, name, value, category, type, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
    const result = stmt.run(userId, name, Number(value), category, type, dataFinal);
    res.status(201).json({id: result.lastInsertRowid, message: "Registro adicionado" });
});

router.delete("/:id", (req, res ) => {

    const userId = req.user.id;
    const { id } = req.params;
    const stmt = db.prepare("DELETE FROM finances WHERE id = ? AND user_id = ?");
    const result = stmt.run(id, userId);
    if (result.changes === 0) {
        return res.status(404).json({error: "Registo não encontrado" });
    }

        res.json({message : "Registro removido" });
});

module.exports = router;