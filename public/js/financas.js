// PT: Variável global do gráfico de pizza
// EN: Global variable for the pie chart
let graficoPizza = null;
// PT: Adiciona um novo registro financeiro
// EN: Adds a new financial record
async function adicionarFinanca() {
    const nome      = document.getElementById('fin-nome').value.trim();
    const valor     = document.getElementById('fin-valor').value;
    const categoria = document.getElementById('fin-categoria').value;
    const tipo      = document.getElementById('fin-tipo').value;
    const dataForm  = document.getElementById('fin-data').value;
    const erroDiv   = document.getElementById('fin-erro');

    if (!nome || !valor) {
        erroDiv.textContent = 'Preencha descrição e valor';
        return;
    }

    try {
        const res = await fetch('/api/finances', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nome, value: valor, category: categoria, type: tipo, date: dataForm })
        });

        const resData = await res.json();

        if (!res.ok) {
            erroDiv.textContent = resData.error;
            return;
        }

        document.getElementById('fin-nome').value  = '';
        document.getElementById('fin-valor').value = '';
        document.getElementById('fin-data').value  = '';
        erroDiv.textContent = '';
        carregarFinancas();

    } catch (err) {
        console.error('Erro ao adicionar finança', err);
        erroDiv.textContent = 'Erro de conexão';
    }
}
// PT: Atualiza o gráfico de rosca por categoria de gastos
// EN: Updates the donut chart by expense category
function atualizarGrafico(gastos) {
    const canvas  = document.getElementById('grafico-gastos');
    const vazioEl = document.getElementById('chart-vazio');

    if (gastos.length === 0) {
        canvas.style.display  = 'none';
        vazioEl.style.display = 'block';
        return;
    }

    canvas.style.display  = 'block';
    vazioEl.style.display = 'none';

    const porCategoria = gastos.reduce((acc, gasto) => {
        acc[gasto.category] = (acc[gasto.category] || 0) + gasto.value;
        return acc;
    }, {});

    const labels = Object.keys(porCategoria);
    const values = Object.values(porCategoria);
    const cores  = ['#6366f1','#4ade80','#f87171','#fb923c','#facc15','#38bdf8','#a78bfa','#f472b6'];

    if (graficoPizza) graficoPizza.destroy();

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
                    labels: { color: '#94a3b8', padding: 12, font: { size: 11 } }
                },
                tooltip: {
                    callbacks: { label: (ctx) => `R$ ${ctx.parsed.toFixed(2)}` }
                }
            }
        }
    });
}
// PT: Atualiza os cards de resumo e dispara o gráfico
// EN: Updates the summary cards and triggers the chart
function atualizarResumoFinancas(data) {
    const saldoEl = document.getElementById('resumo-saldo');
    document.getElementById('resumo-ganhos').textContent = `R$ ${data.totalGanhos.toFixed(2)}`;
    document.getElementById('resumo-gastos').textContent = `R$ ${data.totalGastos.toFixed(2)}`;
    saldoEl.textContent = `R$ ${Math.abs(data.saldo).toFixed(2)}`;
    saldoEl.className   = `metric-value ${data.saldo >= 0 ? 'green' : 'red'}`;
    atualizarGrafico(data.gastos);
}
// PT: Carrega o comparativo mensal da API e renderiza
// EN: Loads the monthly comparison from the API and renders
async function carregarComparativo() {
    try {
        const res  = await fetch('/api/finances/comparativo');
        const data = await res.json();
        const el   = document.getElementById('comparativo');

        function badge(valor, inverso = false) {
            if (valor === 0) return `<span class="variacao neutro">= R$ 0,00</span>`;
            const positivo = inverso ? valor < 0 : valor > 0;
            const classe   = positivo ? 'positivo' : 'negativo';
            const sinal    = positivo ? '+' : '−';
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
        </div>`;

    } catch (err) {
        console.error('Erro ao carregar comparativo:', err);
    }
}
// PT: Carrega as finanças do mês/ano selecionado
// EN: Loads finances for the selected month/year
async function carregarFinancas() {
    const mesEl = document.getElementById('fin-mes');
    const anoEl = document.getElementById('fin-ano');
    const now   = new Date();
    const month = mesEl ? mesEl.value : now.getMonth() + 1;
    const year  = anoEl ? anoEl.value : now.getFullYear();

    try {
        const res  = await fetch(`/api/finances?month=${month}&year=${year}`);
        const data = await res.json();
        renderFinancas(data);
        atualizarResumoFinancas(data);
    } catch (err) {
        console.error('Erro ao carregar finanças', err);
    }
}
// PT: Remove um registro financeiro pelo ID
// EN: Removes a financial record by ID
async function deletarFinanca(id) {
    if (!confirm('Remover este registro?')) return;
    await fetch(`/api/finances/${id}`, { method: 'DELETE' });
    carregarFinancas();
}
// PT: Renderiza a lista de itens financeiros na tela
// EN: Renders the list of financial items on screen
function renderFinancas(data) {
    const lista = document.getElementById('fin-lista');

    if (data.items.length === 0) {
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