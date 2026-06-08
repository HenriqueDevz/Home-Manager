const MESES =['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username' || '');
    document.getElementById('header-user').textContent = username;

    const agora = new Date();
    document.getElementById('compras-mes').textContent=
    `${MESES[agora.getMonth()]} ${agora.getFullYear()}`;
    carregarFinancas();
    carregarCatalogo();
    carregarCompras();
});

function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(`tab-${aba}`).classList.add('active');
    document.getElementById(`nav-${aba}`).classList.add('active');
}

async function carregarFinancas () {
    try {
        const res = await fetch('/api/finances');
        const data = await res.json();

        renderFinancas(data);
        atualizarResumoFinancas(data);

    } catch(err) {
        console.error('Erro ao carregar finanças', err);
    }
}

function renderFinancas(data) {
    const lista = document.getElementById('fin-lista');
    if(data.items.length === 0) {
        lista.innerHTML = `
      <p style="color:#475569;text-align:center;padding:1.5rem">
        Nenhum registro ainda
      </p>`;
      return;
    }

    lista.innerHTML = data.items.map(item => `
    <div class="lista-item">

      <div class="item-info">
        <span class="item-nome">${item.name}</span>
        <span class="item-detalhe">${item.category} · ${item.date}</span>
      </div>

      <span class="item-valor ${item.type === 'income' ? 'green' : 'red'}">
        ${item.type === 'income' ? '+' : '−'} R$ ${item.value.toFixed(2)}
      </span>

      <button class="btn-delete" onclick="deletarFinanca(${item.id})">🗑</button>

    </div>
  `).join('');
}

function atualizarResumoFinancas(data) {
    const saldoEl = document.getElementById('resumo-saldo');

    document.getElementById('resumo-ganhos').textContent = `R$ ${data.totalGanhos.toFixed(2)}`;
    document.getElementById('resumo-gastos').textContent = `R$ ${data.totalGastos.toFixed(2)}`;
    
    saldoEl.textContent = `R$ ${Math.abs(data.saldo).toFixed(2)}`;
    saldoEl.className = `metric-value ${data.saldo >= 0? 'green': 'red'}`;
}

async function adicionarFinanca() {
    const nome = document.getElementById('fin-nome').value.trim();
    const valor = document.getElementById('fin-valor').value;
    const categoria = document.getElementById('fin-categoria').value;
    const tipo = document.getElementById('fin-tipo').value;
    const erroDiv = document.getElementById('fin-erro');

    console.log({name: nome, value: valor, category: categoria, type: tipo});

    if (!nome || !valor) {
        erroDiv.textContent = 'Preencha descrição e valor';
        return;
    }

    try {
        const res = await fetch('/api/finances', {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, value: valor, category: categoria, type: tipo })
        });
        
        const data = await res.json();

        if (!res.ok) {
            erroDiv.textContent = data.error;
            return;
        }

        document.getElementById('fin-nome').value ='';
        document.getElementById('fin-valor').value ='';
        erroDiv.textContent = '';

        carregarFinancas();

    }catch (err) {
        erroDiv.textContent = 'Erro de conexão';
    }
}

async function deletarFinanca(id) {
    if (!confirm('Remover este registro?')) return;
    await fetch(`/api/finances/${id}`, {method: 'DELETE' });
    carregarFinancas();
}

async function carregarCatalogo() {
    try {
        const res = await fetch('/api/shopping/products');
        const data = await res.json();

        document.getElementById('comp-item').innerHTML = data.products
        .map(p => `<option value ="${p.id}">${p.name} - ${p.category}</option>`)
        .join('');

    }catch (err) {
        console.error('Erro ao carregar catálogo', err);
    }
}

async function carregarCompras() {
    try {
        const res = await fetch('/api/shopping');
        const data = await res.json();

        renderCompras(data.items);
        atualizarResumoCompras(data.items);
    }catch (err) {
        console.error('Erro ao carregar compras', err);
    }
}

function renderCompras(items) {
    const lista = document.getElementById('comp-lista');
    if (items.length ===0) {
        lista.innerHTML = `
      <p style="color:#475569;text-align:center;padding:1.5rem">
        Lista vazia — adicione itens acima
      </p>`;
      return;
    }

    lista.innerHTML = items.map(item => `
    <div class="lista-item">

      <div class="item-info">
        <span class="item-nome">${item.name}</span>
        <span class="item-detalhe">${item.qty_comprada} / ${item.base_qty} unid.</span>
      </div>

      <span class="badge ${item.status}">${traduzirStatus(item.status)}</span>

      <!-- PT: Botões +/- passam a qtd atual para calcular a nova -->
      <!-- EN: +/- buttons pass the current qty to calculate the new one -->
      <div class="qty-controls">
        <button class="btn-icon" onclick="alterarQty('${item.product_id}', ${item.qty_comprada}, -1)">−</button>
        <span>${item.qty_comprada}</span>
        <button class="btn-icon" onclick="alterarQty('${item.product_id}', ${item.qty_comprada}, +1)">+</button>
      </div>

      <button class="btn-delete" onclick="deletarItemBase(${item.id})">🗑</button>

    </div>
  `).join('');
}

function traduzirStatus(status) {
    const map = { faltando: 'Falta', ok: 'OK', excesso: 'Excesso' };
    return map[status] || status;
}

function atualizarResumoCompras(items) {
    document.getElementById('resumo-faltando').textContent =
    items.filter(i => i.status === 'faltando').length;

    document.getElementById('resumo-ok').textContent =
    items.filter(i => i.status === 'ok').length;
}

async function adicionarItemBase() {
    const productId = document.getElementById('comp-item').value;
    const baseQty = document.getElementById('comp-qty').value;
    const erroDiv = document.getElementById('comp-erro');

    try {
        const res = await fetch('/api/shopping/base', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({product_id:productId, base_qty: baseQty})
        });
        const data = await res.json();

        if (!res.ok) {
            erroDiv.textContent = data.error;
            return;
        }

        erroDiv.textContent ='';
        carregarCompras();

    }catch (err) {
        erroDiv.textContent = 'Erro de conexão';
    }
}

async function alterarQty (item, qtdAtual, delta) {
    const novaQty = Math.max(0, qtdAtual + delta);
    
    await fetch(`/api/shopping/monthly/${item}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: novaQty })
    });

    carregarCompras();
}


async function deletarItemBase(id) {
    if (!confirm('Remover este item da lista base?')) return;
    await fetch(`/api/shopping/base/${id}`, {method: 'DELETE' });
    carregarCompras();
}

async function logout() {
    await fetch('/auth/logout', {method: 'POST' });
    localStorage.removeItem('username');
    window.location.href = '/';
}