const express = require("express");
const { db } = require("../db");

const router = express.Router();

router.get("/products", async (req, res) => {
    const result = await db.execute
    ("SELECT id, name, category FROM products ORDER BY category, name"
    );
    res.json({ products: result.rows });
});

router.get("/", async (req, res ) => {
    const userId = req.user.id;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    try {
        const result = await db.execute({
        sql:`
        SELECT 
        sb.id                      AS id,
        p.id                       AS product_id,
        p.name                     AS name,
        p.category                 AS category,
        sb.base_qty                AS base_qty,
        COALESCE(sm.qty, 0)        AS qty_comprada,
        COALESCE(sm.price, 0)      AS price
        FROM shopping_base sb
        JOIN products p
          ON sb.product_id = p.id
        LEFT JOIN shopping_monthly sm
         ON sm.product_id  = sb.product_id
         AND sm.user_id    = sb.user_id
         AND sm.month      = ?
         AND sm.year       = ?
        WHERE sb.user_id = ?
        ORDER BY p.category, p.name
        `,
        args:[month, year, userId]
    });
        const items = result.rows.map(item => {
            const diferenca = item.base_qty - item.qty_comprada;

        let status;
        if (diferenca > 0 )       status = "faltando";
        else if (diferenca === 0) status = "ok";
        else                      status = "excesso";

        return { ...item, diferenca: Math.abs(diferenca), status };
        });

    const ordem = { faltando : 0, ok: 1, excesso: 2 };
    items.sort((a, b) => ordem[a.status] - ordem[b.status]);

    res.json({items: items, month, year });
    } catch (err) {
        console.error("Erro ao carregar compras:",err);
        res.status(500).json({ error:"Erro ao carregar compras"});
    }
});


router.post("/base", async(req, res) => {
    const userId = req.user.id;
    const { product_id, base_qty } = req.body;

    if (!product_id || !base_qty) {
        return res.status(400).json({ error: "product_id e quantidade obrigatórios" });
    }
    const prodResult = await db.execute({
        sql:"SELECT id FROM products WHERE id = ?",
        args:[product_id]
    });
    if(prodResult.rows.length === 0) {
        return res.status(404).json({error: "Produto não encontrado" });
    }
    try {
        const result = await db.execute({
        
        sql:"INSERT INTO shopping_base (user_id, product_id,  base_qty) VALUES (?, ?, ?)",
        args:[userId, product_id, Number (base_qty)]
    });
        res.status(201).json({ id: Number (result.lastInsertRowid), message: "Item Adicionado" });
    } catch (err) {
        res.status(409).json({ error: "Item já esta na lista base" });
    }
});

router.put("/monthly/:productId", async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { qty, price } = req.body;

    if (qty == undefined || qty === null) {
        return res.status(400).json({ error: "Quantidade obrigatória" });
    }
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
         await db.execute({
            sql:`
            INSERT OR REPLACE INTO shopping_monthly (user_id, product_id, qty, price, month, year)
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            args:[userId, productId, Number(qty),Number(price) || 0, month, year]
        });
        res.json({ message: "Quantidade atualizada" });
    } catch (err) {
        console.error("Error ao atualizar:", err);
        res.status(500).json({ error: "Erro ao atualizar" });
    }
});

router.patch("/monthly/:productId/price", async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { price } = req.body;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    try {
        await db.execute({
            sql : `
            UPDATE shopping_monthly
            SET price = ?
            WHERE user_id = ? AND product_id = ? AND month = ? AND year = ?
            `,
            args: [Number(price) || 0, userId, productId, month, year]
        });
        res.json({ message: "Preço atualizado" });
    } catch(err) {
        console.error("Erro ao atualizar preço:", err);
        res.status(500).json({ error: "Erro ao atualizar preço" });
    }
});

router.delete("/base/:id", async (req, res) => { 
    const userId = req.user.id;
    const { id } = req.params;
    const result = await db.execute({
    sql:"DELETE FROM shopping_base WHERE id = ? AND user_id = ?",
    args:[id, userId]
    });
    if (result.rowsAffected === 0) {
        return res.status(404).json({error: "Item não encontrado" });
    }
    res.json({ message: "Item removido" });
});

router.delete("/monthly", async (req, res) => {
    const userId = req.user.id;
    
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const result = await db.execute({
    sql:"DELETE FROM shopping_monthly WHERE user_id = ? AND month = ? AND year = ?",
    args:[userId, month, year]
    });
    res.json({ message: `${result.rowsAffected} itens zerados`, rowsAffected: result.rowsAffected });
});

router.put("/base/:id", async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { base_qty } = req.body;

    if(!base_qty || Number(base_qty)< 1) {
        return res.status(400).json({ error: "Quantidade inválida" });
    }
    
    const result = await db.execute({
    sql:"UPDATE shopping_base SET base_qty = ? WHERE id = ? AND user_id = ?",
    args:[Number(base_qty), id, userId]
    });
    if (result.rowsAffected === 0) {
        return res.status(404).json({ error: "Item não encontrado" });     
    }
    res.json({ message: "Quantidade atualizada" });
});
module.exports = router; 