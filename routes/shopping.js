const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/products", (req, res) => {
    const products = db
    .prepare("SELECT id, name, category FROM products ORDER BY category, name")
    .all();

    res.json({ products });
});

router.get("/", (req, res ) => {
    const userId = req.user.id;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const items = db.prepare(`
        SELECT 
        sb.id                      AS id,
        p.id                       AS product_id,
        p.name                     AS name,
        p.category                 AS category,
        sb.base_qty                AS base_qty,
        COALESCE(sm.qty, 0)        AS qty_comprada
        
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
        `).all(month, year, userId);

        const result = items.map(item => {
            const diferenca = item.base_qty - item.qty_comprada;

        let status;
        if (diferenca > 0 )       status = "faltando";
        else if (diferenca === 0) status = "ok";
        else                      status = "excesso";

        return { ...item, diferenca: Math.abs(diferenca), status };
        });

    const ordem = { faltando : 0, ok: 1, excesso: 2 };
    result.sort((a, b) => ordem[a.status] - ordem[b.status]);

    res.json({items: result, month, year });
});


router.post("/base", (req, res) => {
    const userId = req.user.id;
    const { product_id, base_qty } = req.body;

    if (!product_id || !base_qty) {
        return res.status(400).json({ error: "product_id e quantidade obrigatórios" });
    }
    const produto = db
    .prepare("SELECT id FROM products WHERE id = ?")
    .get(product_id);

    if(!produto) {
        return res.status(404).json({error: "Produto não encontrado" });
    }

    try {
        const result = db
        .prepare("INSERT INTO shopping_base (user_id, product_id,  base_qty) VALUES (?, ?, ?)")
        .run(userId, product_id, Number(base_qty));
        res.status(201).json({ id: result.lastInsertRowid, message: "Item Adicionado" });
    } catch (err) {
        res.status(409).json({ error: "Item já esta na lista base" });
    }
});

router.put("/monthly/:productId", (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { qty } = req.body;

    if (qty == undefined) {
        return res.status(400).json({ error: "Quantidade obrigatória" });
    }
const now = new Date();
const month = now.getMonth() + 1;
const year = now.getFullYear();

  db.prepare (`
    INSERT OR REPLACE INTO shopping_monthly (user_id, product_id, qty, month, year)
    VALUES (?, ?, ?, ?, ?)
   `).run(userId, productId, Number(qty), month, year);
    res.json({ message: "Quantidade atualizada" });
});

router.delete("/base/:id", (req, res) => { 
    const userId = req.user.id;
    const { id } = req.params;
    const result = db
    .prepare("DELETE FROM shopping_base WHERE id = ? AND user_id = ?")
    .run(id, userId);
    if (result.changes === 0) {
        return res.status(404).json({error: "Item não encontrado" });
    }
    res.json({ message: "Item removido" });
});

module.exports = router;