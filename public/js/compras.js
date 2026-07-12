// PT: Array global com todos os itens de compras carregados
// EN: Global array with all loaded shopping items
let todosItensCompras = [];
// PT: Array global com todos os produtos do catálogo
// EN: Global array with all catalog products
let todosProdutos = [];
// PT: Adiciona um item à lista base de compras
// EN: Adds an item to the base shopping list
async function adicionarItemBase() {
    const productId = document.getElementById('comp-item').value;
    const baseQty   = document.getElementById('comp-qty').value;
    const erroDiv   = document.getElementById('comp-erro');

    try {
        const res = await fetch('/api/shopping/base', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, base_qty: baseQty })
        });

        const data = await res.json();

        if (!res.ok) {
            erroDiv.textContent = data.error;
            return;
        }

        erroDiv.textContent = '';
        document.getElementById('comp-busca').value = '';
        document.getElementById('comp-item').value  = '';
        document.getElementById('comp-qty').value   = 1;
        carregarCompras();

    } catch (err) {
        erroDiv.textContent = 'Erro de conexão';
    }
}
// PT: Altera a quantidade comprada de um item
// EN: Changes the purchased quantity of an item
async function alterarQty(item, qtdAtual, delta) {
    const novaQty    = Math.max(0, qtdAtual + delta);
    const priceInput = document.querySelector(`.price-input[data-product-id="${item}"]`);
    const preco      = priceInput ? Number(priceInput.value) || 0 : 0;

    await fetch(`/api/shopping/monthly/${item}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: novaQty, price: preco })
    });

    await carregarCompras();
    atualizarTotalCompras();
}
// PT: Atualiza o preço de um item no banco
// EN: Updates the price of an item in the database
async function atualizarPreco(input) {
    const productId = input.dataset.productId;
    const valor     = input.value;

    try {
        await fetch(`/api/shopping/monthly/${productId}/price`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: Number(valor) || 0 })
        });
        atualizarTotalCompras();
    } catch (err) {
        console.error('Erro ao atualizar preço:', err);
    }
}
// PT: Atualiza os cards de resumo de compras
// EN: Updates the shopping summary cards
function atualizarResumoCompras(items) {
    document.getElementById('resumo-faltando').textContent =
        items.filter(i => i.status === 'faltando').length;
    document.getElementById('resumo-ok').textContent =
        items.filter(i => i.status === 'ok').length;
    atualizarTotalCompras();
}
// PT: Recalcula o total somando preço × quantidade de cada item
// EN: Recalculates total by summing price × quantity per item
function atualizarTotalCompras() {
    const inputs = document.querySelectorAll('.price-input');
    let total = 0;

    inputs.forEach(input => {
        const preco = Number(input.value) || 0;
        const qty   = Number(input.closest('.lista-item')
            ?.querySelector('.qty-controls span')?.textContent) || 0;
        total += preco * qty;
    });

    const el = document.getElementById('comp-total');
    if (el) el.textContent = `R$ ${total.toFixed(2)}`;
}
// PT: Cancela a edição e esconde o formulário
// EN: Cancels the edit and hides the form
function cancelarEdicao(id) {
    document.getElementById(`edit-form-${id}`).style.display = 'none';
}
// PT: Carrega o catálogo de produtos da API
// EN: Loads the product catalog from the API
async function carregarCatalogo() {
    try {
        const res  = await fetch('/api/shopping/products');
        const data = await res.json();
        todosProdutos = data.products;
    } catch (err) {
        console.error('Erro ao carregar catálogo', err);
    }
}
// PT: Carrega a lista de compras e atualiza a tela
// EN: Loads the shopping list and updates the screen
async function carregarCompras() {
    try {
        const res  = await fetch('/api/shopping');
        const data = await res.json();

        todosItensCompras = data.items;
        popularFiltro(data.items);
        renderCompras(data.items);
        atualizarResumoCompras(data.items);

    } catch (err) {
        console.error('Erro ao carregar compras:', err);
    }
}
// PT: Remove um item da lista base
// EN: Removes an item from the base list
async function deletarItemBase(id) {
    if (!confirm('Remover este item da lista base?')) return;
    await fetch(`/api/shopping/base/${id}`, { method: 'DELETE' });
    carregarCompras();
}
// PT: Filtra os itens da lista pela categoria selecionada
// EN: Filters list items by the selected category
function filtrarCategoria() {
    const categoria      = document.getElementById('comp-filtro').value;
    const itensFiltrados = categoria
        ? todosItensCompras.filter(i => i.category === categoria)
        : todosItensCompras;
    renderCompras(itensFiltrados);
}
// PT: Filtra produtos no autocomplete conforme o usuário digita
// EN: Filters products in autocomplete as the user types
function filtrarProdutos() {
    const busca = document.getElementById('comp-busca').value.trim().toUpperCase();
    const lista = document.getElementById('autocomplete-lista');
    document.getElementById('comp-item').value = '';

    if (busca.length < 1) {
        lista.classList.remove('aberta');
        return;
    }

    const filtrados = todosProdutos.filter(p =>
        p.name.includes(busca) || p.category.toUpperCase().includes(busca)
    );

    lista.innerHTML = filtrados.length === 0
        ? `<div class="autocomplete-item" style="color:var(--text-muted)">Nenhum produto encontrado</div>`
        : filtrados.map(p => `
            <div class="autocomplete-item" onclick="selecionarProduto(${p.id}, '${p.name}', '${p.category}')">
                ${p.name} <span>${p.category}</span>
            </div>
          `).join('');

    lista.classList.add('aberta');
}
// PT: Exibe o formulário de edição de quantidade base
// EN: Shows the base quantity edit form
function mostrarEdicao(id) {
    const form        = document.getElementById(`edit-form-${id}`);
    form.style.display    = 'flex';
    form.style.gap        = '8px';
    form.style.alignItems = 'center';
    form.style.padding    = '8px 1rem';
    document.getElementById(`edit-qty-${id}`).focus();
}
// PT: Popula o select de filtro com as categorias disponíveis
// EN: Populates the filter select with available categories
function popularFiltro(items) {
    const select     = document.getElementById('comp-filtro');
    const categorias = [...new Set(items.map(i => i.category))].sort();
    select.innerHTML = `<option value="">Todas as categorias</option>` +
        categorias.map(c => `<option value="${c}">${c}</option>`).join('');
}
// PT: Renderiza os itens da lista de compras na tela
// EN: Renders the shopping list items on screen
function renderCompras(items) {
    const lista = document.getElementById('comp-lista');

    if (items.length === 0) {
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

        <div class="qty-controls">
            <button class="btn-icon" onclick="alterarQty('${item.product_id}', ${item.qty_comprada}, -1)">−</button>
            <span>${item.qty_comprada}</span>
            <button class="btn-icon" onclick="alterarQty('${item.product_id}', ${item.qty_comprada}, +1)">+</button>
        </div>

        <div class="price-input-wrapper">
            <span class="price-prefix">R$</span>
            <input type="number" class="price-input"
                   data-product-id="${item.product_id}"
                   value="${item.price > 0 ? item.price.toFixed(2) : ''}"
                   placeholder="0,00"
                   step="0.01" min="0"
                   onchange="atualizarPreco(this)"
                   onclick="this.select()">
        </div>

        <button class="btn-icon" onclick="mostrarEdicao(${item.id})" title="Editar quantidade base">✏️</button>
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
// PT: Salva a nova quantidade base do item
// EN: Saves the new base quantity for the item
async function salvarEdicao(id) {
    const novaQty = document.getElementById(`edit-qty-${id}`).value;

    try {
        const res = await fetch(`/api/shopping/base/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base_qty: novaQty })
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
// PT: Preenche o campo com o produto selecionado no autocomplete
// EN: Fills the field with the product selected in autocomplete
function selecionarProduto(id, nome, categoria) {
    document.getElementById('comp-busca').value = `${nome} - ${categoria}`;
    document.getElementById('comp-item').value  = id;
    document.getElementById('autocomplete-lista').classList.remove('aberta');
}
// PT: Traduz o status do item para português
// EN: Translates item status to Portuguese
function traduzirStatus(status) {
    const map = { faltando: 'Falta', ok: 'OK', excesso: 'Excesso' };
    return map[status] || status;
}
// PT: Zera as compras do mês mantendo a lista base
// EN: Resets monthly purchases keeping the base list
async function zerarMes() {
    if (!confirm('Zerar todas as compras do mês? Os itens da lista base permanecem.')) return;

    try {
        await fetch('/api/shopping/monthly', { method: 'DELETE' });
        carregarCompras();
    } catch (err) {
        console.error('Erro ao zerar mês:', err);
    }
}
// PT: Fecha o autocomplete ao clicar fora do campo
// EN: Closes autocomplete when clicking outside the field
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-wrapper')) {
        document.getElementById('autocomplete-lista').classList.remove('aberta');
    }
});