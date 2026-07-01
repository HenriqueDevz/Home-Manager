const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/", async (req, res) => {
    const userId = req.user.id;

    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();


    const result = await db.execute({
    sql:`
        SELECT * FROM finances
        WHERE user_id = ?
            AND strftime('%m-%Y', date) = ?
        ORDER BY date DESC
    `,
    args: [userId, `${String(month).padStart(2, '0')}-${year}`]
    });
    const items = result.rows;

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

router.get("/comparativo", async (req, res) => {
    const userId = req.user.id;

    const now = new Date();
    const mesAtual = now.getMonth() + 1;
    const anoAtual = now.getFullYear();

    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

    async function buscarTotais(month, year) {
        const result = db.execute({
            sql:`
            SELECT type, SUM(value) as total 
            FROM finances
            WHERE user_id = ?
                AND strftime('%m-%Y', date) = ?
            GROUP BY type
        `,
        args:[userId, `${String(month).padStart(2, '0')}-${year}`]
        });
        const rows = result.rows || [];

        const totais = { income: 0, expense: 0 };
        rows.forEach(i => {totais[i.type] = i.total; });

        return {
            ganhos: totais.income,
            gastos: totais.expense,
            saldo: totais.income - totais.expense
        };
    }
    const atual = await buscarTotais(mesAtual, anoAtual);
    const anterior = await buscarTotais(mesAnterior, anoAnterior);

    res.json({
        atual,
        anterior,
        variacao: {
            ganhos: atual.ganhos - anterior.ganhos,
            gastos: atual.gastos - anterior.gastos,
            saldo: atual.saldo - anterior.saldo
        },
        periodos: {
            atual: `${String(mesAtual).padStart(2, '0')}-${anoAtual}`,
            anterior: `${String(mesAnterior).padStart(2, '0')}-${anoAnterior}`
        }
    });
});
router.post("/", async (req, res) => {
    const userId = req.user.id;
    const {name, value, category, type, date } = req.body;
    
    if (!name || !value || !category || !type) {
        return res.status(400).json({error: "Campos obrigatórios faltando "});
    }
    if (!["income", "expense"].includes(type)) {
        return res.status(400).json({error: "Tipo inválido "});
    }
    const dataFinal = date || new Date().toISOString().split('T')[0];
    const result = db.execute({
        sql:`
        INSERT INTO finances (user_id, name, value, category, type, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    args : [userId, name, Number(value), category, type, dataFinal]
    });
    res.status(201).json({id: result.lastInsertRowid, message: "Registro adicionado" });
});

router.delete("/:id", async (req, res ) => {

    const userId = req.user.id;
    const { id } = req.params;
    const result = db.execute({
        sql: "DELETE FROM finances WHERE id = ? AND user_id = ?",
        args: [id, userId]
    });
    if (result.rowsAffected === 0) {
        return res.status(404).json({error: "Registo não encontrado" });
    }
        res.json({message : "Registro removido" });
});

module.exports = router;