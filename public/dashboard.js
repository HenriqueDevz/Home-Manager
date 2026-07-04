const MESES =['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

document.addEventListener('DOMContentLoaded', () => {
    restaurarTema();
    definirPeriodoAtual();
    definirDataHoje();
    const username = localStorage.getItem('username') || '';
    document.getElementById('header-user').textContent = username;

    const agora = new Date();
    document.getElementById('compras-mes').textContent=
    `${MESES[agora.getMonth()]} ${agora.getFullYear()}`;
    carregarFinancas();
    carregarComparativo();
    carregarCatalogo();
    carregarCompras();

    mudarAba('resumo');
});
const tabBlobs = {
    resumo: {
        bg: '#262141',
        blobs: [
        {w:380, h:380, bg:'#7f77DD', top:'-80px', left:'auto', right:'-60px' },
        {w:280, h:280, bg:'#AFA9EC',top:'auto', left:'-69px', bottom: '100px' },
        {w:200, h:200, bg:'#CECBF6', top:'50%', left:'40%' }
    ]
},
    financas: {
        bg: '#243a24',
        blobs: [
        {w:380, h:380, bg:'#97C459', top:'-80px', right:'-60px' },
        {w:280, h:280, bg:'#9FE1CB', top:'auto', left:'-60px', bottom:'100px' },
        {w:200, h:200, bg:'#C0DD97', top:'50px', left:'40%' }
    ],
},
    compras: {
        bg: '#1e2a3a',
        blobs: [
        {w:380, h:380, bg:'#85B7EB', top:'-70px', left:'-60px' },
        {w:280, h:280, bg:'#B5D4F4', top:'auto', right:'-60px', bottom:'80px' },
        {w:200, h:200, bg:'#378ADD', top:'45%', right:'35%' }
    ]
    }
};

function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${aba}`).classList.add('active');
    document.getElementById(`nav-${aba}`).classList.add('active');

    const config = tabBlobs[aba];
    document.getElementById('page-bg').style.background = config.bg;

    [1, 2, 3].forEach((n, i) => {
        const b = document.getElementById(`blob${n}`);
        const cfg = config.blobs[i];
        b.style.width = cfg.w + 'px';
        b.style.height = cfg.h + 'px';
        b.style.background = cfg.bg;
        b.style.top = cfg.top || 'auto';
        b.style.left = cfg.left || 'auto';
        b.style.right = cfg.right || 'auto';
        b.style.bottom = cfg.bottom || 'auto'
    });
}

async function carregarFinancas () {
    const mesEl = document.getElementById('fin-mes');
    const anoEl = document.getElementById('fin-ano');

    const now = new Date();
    const month = mesEl ? mesEl.value : now.getMonth() + 1;
    const year = anoEl ? anoEl.value : now.getFullYear();

    try {
        const res = await fetch(`/api/finances?month=${month}&year=${year}`);
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

let graficoPizza = null;

function atualizarResumoFinancas(data) {
    const saldoEl = document.getElementById('resumo-saldo');

    document.getElementById('resumo-ganhos').textContent = `R$ ${data.totalGanhos.toFixed(2)}`;
    document.getElementById('resumo-gastos').textContent = `R$ ${data.totalGastos.toFixed(2)}`;
    
    saldoEl.textContent = `R$ ${Math.abs(data.saldo).toFixed(2)}`;
    saldoEl.className = `metric-value ${data.saldo >= 0? 'green': 'red'}`;
    atualizarGrafico(data.gastos);
}

function atualizarGrafico(gastos) {
    const canvas = document.getElementById('grafico-gastos');
    const vazioEl = document.getElementById('chart-vazio');

    if (gastos.length === 0) {
        canvas.style.display = 'none';
        vazioEl.style.display = 'block';
        return;
    }

    canvas.style.display = 'block';
    vazioEl.style.display = 'none';

    const porCategoria = gastos.reduce((acc, gasto) => {
        acc[gasto.category] = (acc[gasto.category] || 0) + gasto.value;
        return acc;
    }, {});

    const labels = Object.keys(porCategoria);
    const values = Object.values(porCategoria);

    const cores = ['#6366f1','#4ade80','#f87171','#fb923c','#facc15','#38bdf8','#a78bfa','#f472b6'];

    if (graficoPizza) {
        graficoPizza.destroy();
    }
    
    graficoPizza = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: cores.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#1a1a24'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        padding: 12,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `R$ ${ctx.parsed.toFixed(2)}`
                    }
                }
            }
        }
    });
}

async function adicionarFinanca() {
    const nome = document.getElementById('fin-nome').value.trim();
    const valor = document.getElementById('fin-valor').value;
    const categoria = document.getElementById('fin-categoria').value;
    const tipo = document.getElementById('fin-tipo').value;
    const dataForm = document.getElementById('fin-data').value;
    const erroDiv = document.getElementById('fin-erro');

    const  month = document.getElementById('fin-mes').value;
    const year = document.getElementById('fin-ano').value;


    if (!nome || !valor) {
        erroDiv.textContent = 'Preencha descrição e valor';
        return;
    }

    try {
        const res = await fetch('/api/finances', {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, value: valor, category: categoria, type: tipo, date: dataForm })
        });
        
        const resData = await res.json();

        if (!res.ok) {
            erroDiv.textContent = resData.error;
            return;
        }

        document.getElementById('fin-nome').value ='';
        document.getElementById('fin-valor').value ='';
        document.getElementById('fin-data').value ='';
        erroDiv.textContent = '';

        carregarFinancas();

    } catch (err) {
        console.log('Erro ao adicionar finança', err);
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
      <button class="btn-icon" onclick="mostrarEdicao(${item.id}, ${item.base_qty})" title="Editar quantidade base">✏️</button>
      <button class="btn-delete" onclick="deletarItemBase(${item.id})">🗑</button>

    </div>

    <div class="edit-form" id="edit-form-${item.id}" style="display:none">
        <input type="number" id="edit-qty-${item.id}" value="${item.base_qty}" min="1" max="99"
               style="width:80px;margin-right:8px">
        <button class="btn-primary" style="width:auto;padding:6px 12px"
                onclick="salvarEdicao(${item.id})">Salvar</button>
        <button class="btn-secondary" style="width:auto;padding:6px 12px;margin-top:0"
                onclick="cancelarEdicao(${item.id})">Cancelar</button>
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

async function zerarMes() {
    if (!confirm('Zerar todas as compras do mês? Os itens da lista base permanecem.'))
        return;

    try {
        const res = await fetch('/api/shopping/monthly', { method: 'DELETE' });
        const data = await res.json();

        carregarCompras();

    }catch (err) {
        console.error('Erro ao zerar mês:', err);
    }
}

function mostrarEdicao (id, qtdAtual) {
    document.getElementById(`edit-form-${id}`).style.display = 'flex';
    document.getElementById(`edit-form-${id}`).style.gap = '8px';
    document.getElementById(`edit-form-${id}`).style.alignItems = 'center';
    document.getElementById(`edit-form-${id}`).style.padding = '8px 1rem';
    document.getElementById(`edit-qty-${id}`).focus();

}

function cancelarEdicao(id) {
    document.getElementById(`edit-form-${id}`).style.display = 'none';
}

async function salvarEdicao(id) {
    const novaQty = document.getElementById(`edit-qty-${id}`).value;

    try {
        const res = await fetch(`/api/shopping/base/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_qty: novaQty})
        });
        
        const data = await res.json();

        if (!res.ok) {
            alert(data.error);
            return;
        }

        carregarCompras();
    } catch (err) {
        alert('Erro de conexão');
    }
}

let todosItensCompras = [];

async function carregarCompras() {
    try {
        const res = await fetch('/api/shopping');
        const data = await res.json();

        todosItensCompras = data.items;
        popularFiltro(data.items);
        renderCompras(data.items);
        atualizarResumoCompras(data.items);

    } catch(err) {
        console.error('Erro ao carregar compras:', err);
    }
}

function popularFiltro(items) {
    const select = document.getElementById('comp-filtro');
    const categorias = [...new Set(items.map(i => i.category))].sort();

    select.innerHTML = `<option value="">Todas as categorias</option>`+
    categorias.map(c => `<option value="${c}">${c}</option>`).join('');
}

function filtrarCategoria () {
    const  categoria = document.getElementById('comp-filtro').value;
    const itensFiltrados = categoria
        ? todosItensCompras.filter(i => i.category === categoria)
        :todosItensCompras;

        renderCompras(itensFiltrados);
}

function toggleTema () {
    const body = document.body;
    const btn = document.getElementById('btn-tema');
    const isLight = body.classList.toggle('light-mode');

    btn.textContent = isLight ? '☀️' : '🌙';

    localStorage.setItem('tema', isLight ? 'light' : 'dark');
}

function restaurarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if(temaSalvo === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('btn-tema').textContent = '☀️';
    }
}

function definirPeriodoAtual() {
    const now = new Date();

    const mesEl = document.getElementById('fin-mes');
    const anoEl = document.getElementById('fin-ano');

    if (mesEl) mesEl.value = String(now.getMonth() + 1);
    if (anoEl) anoEl.value = String(now.getFullYear());
}

function definirDataHoje() {
    const input = document.getElementById('fin-data');
    if(input) {
        input.value = new Date().toISOString().split('T')[0];
    }
}

async function carregarComparativo() {
    try {
        const res = await fetch('/api/finances/comparativo');
        const data = await res.json();

        const el = document.getElementById('comparativo');

        function badge(valor, inverso=false) {
            if (valor === 0) return `<span class="variacao neutro">= R$ 0,00</span>`;

            const positivo = inverso ? valor < 0 : valor > 0;
            const classe = positivo ? 'positivo' : 'negativo';
            const sinal = positivo ? '+' : '−';
            return `<span class="variacao ${classe}">${sinal} R$ ${Math.abs(valor).toFixed(2)}</span>`;
        }

        el.innerHTML = `
        <div class="comparativo-header">
            <span>Indicador</span>
            <div style="display:flex;gap:1rem">
                <span style="min-width:80px;text-align:right">${data.periodos.anterior}</span>
                    <span style="min-width:80px;text-align:right">${data.periodos.atual}</span>
                    <span style="min-width:80px;text-align:right">Variação</span>
                </div>
            </div>

            <div class="comparativo-row">
                <span class="comparativo-label">💚 Ganhos</span>
                <div class="comparativo-valores">
                    <span class="comparativo-valor">R$ ${data.anterior.ganhos.toFixed(2)}</span>
                    <span class="comparativo-valor">R$ ${data.atual.ganhos.toFixed(2)}</span>
                    ${badge(data.variacao.ganhos)}
                </div>
            </div>

            <div class="comparativo-row">
                <span class="comparativo-label">❤️ Gastos</span>
                <div class="comparativo-valores">
                    <span class="comparativo-valor">R$ ${data.anterior.gastos.toFixed(2)}</span>
                    <span class="comparativo-valor">R$ ${data.atual.gastos.toFixed(2)}</span>
                    ${badge(data.variacao.gastos, true)}
                </div>
            </div>

            <div class="comparativo-row">
                <span class="comparativo-label">💰 Saldo</span>
                <div class="comparativo-valores">
                    <span class="comparativo-valor">R$ ${data.anterior.saldo.toFixed(2)}</span>
                    <span class="comparativo-valor">R$ ${data.atual.saldo.toFixed(2)}</span>
                    ${badge(data.variacao.saldo)}
                </div>
            </div>
        `;

    } catch (err) {
        console.error('Erro ao carregar comparativo:', err);
    }
}