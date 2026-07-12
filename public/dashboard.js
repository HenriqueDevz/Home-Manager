// PT: Ponto de entrada — inicializa o app quando o DOM carrega
// EN: Entry point — initializes the app when the DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // PT: Restaura o tema salvo pelo usuário
    // EN: Restores the theme saved by the user
    restaurarTema();
    // PT: Define o mês/ano atual nos selects de finanças
    // EN: Sets the current month/year in the finance selects
    definirPeriodoAtual();
    // PT: Define a data de hoje no input de data
    // EN: Sets today's date in the date input
    definirDataHoje();
    // PT: Exibe o nome do usuário logado no header
    // EN: Displays the logged user's name in the header
    const username = localStorage.getItem('username') || '';
    document.getElementById('header-user').textContent = username;
    // PT: Exibe o mês atual na aba de compras
    // EN: Displays the current month in the shopping tab
    const agora = new Date();
    document.getElementById('compras-mes').textContent=
    `${MESES[agora.getMonth()]} ${agora.getFullYear()}`;
    // PT: Carrega os dados de cada módulo
    // EN: Loads data from each module
    carregarFinancas();
    carregarComparativo();
    carregarCatalogo();
    carregarCompras();
    // PT: Inicializa a aba de resumo com os blobs corretos
    // EN: Initializes the summary tab with the correct blobs
    mudarAba('resumo');
});
