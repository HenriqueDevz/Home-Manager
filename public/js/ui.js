// PT: Array com os nomes dos meses em português
// EN: Array with month names in Portuguese
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];
// PT: Configuração dos fundos e blobs por aba
// EN: Background and blob configuration per tab
const tabBlobs = {
    resumo: {
        bg: '#262141',
        blobs: [
            { w:380, h:380, bg:'#7f77DD', top:'-80px',  left:'auto',  right:'-60px',  bottom:'auto'  },
            { w:280, h:280, bg:'#AFA9EC', top:'auto',   left:'-69px', right:'auto',   bottom:'100px' },
            { w:200, h:200, bg:'#CECBF6', top:'50%',    left:'40%',   right:'auto',   bottom:'auto'  }
        ]
    },
    financas: {
        bg: '#243a24',
        blobs: [
            { w:380, h:380, bg:'#97C459', top:'-80px',  left:'auto',  right:'-60px',  bottom:'auto'  },
            { w:280, h:280, bg:'#9FE1CB', top:'auto',   left:'-60px', right:'auto',   bottom:'100px' },
            { w:200, h:200, bg:'#C0DD97', top:'50px',   left:'40%',   right:'auto',   bottom:'auto'  }
        ]
    },
    compras: {
        bg: '#1e2a3a',
        blobs: [
            { w:380, h:380, bg:'#85B7EB', top:'-70px',  left:'-60px', right:'auto',   bottom:'auto' },
            { w:280, h:280, bg:'#B5D4F4', top:'auto',   left:'auto',  right:'-60px',  bottom:'80px' },
            { w:200, h:200, bg:'#378ADD', top:'45%',    left:'auto',  right:'35%',    bottom:'auto' }
        ]
    }
};
// PT: Define a data de hoje no input de data
// EN: Sets today's date in the date input
function definirDataHoje() {
    const input = document.getElementById('fin-data');
    if (input) input.value = new Date().toISOString().split('T')[0];
}
// PT: Define o período atual nos selects de mês e ano
// EN: Sets the current period in month and year selects
function definirPeriodoAtual() {
    const now   = new Date();
    const mesEl = document.getElementById('fin-mes');
    const anoEl = document.getElementById('fin-ano');
    if (mesEl) mesEl.value = String(now.getMonth() + 1);
    if (anoEl) anoEl.value = String(now.getFullYear());
}
// PT: Troca de abas e atualiza os blobs com a cor temática
// EN: Switches tabs and updates blobs with the themed color
function mudarAba(aba) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${aba}`).classList.add('active');
    document.getElementById(`nav-${aba}`).classList.add('active');

    const config = tabBlobs[aba];
    document.getElementById('page-bg').style.background = config.bg;

    [1, 2, 3].forEach((n, i) => {
        const b   = document.getElementById(`blob${n}`);
        const cfg = config.blobs[i];
        b.style.width      = cfg.w + 'px';
        b.style.height     = cfg.h + 'px';
        b.style.background = cfg.bg;
        b.style.top        = cfg.top;
        b.style.left       = cfg.left;
        b.style.right      = cfg.right;
        b.style.bottom     = cfg.bottom;
    });
}
// PT: Restaura o tema salvo no localStorage
// EN: Restores the theme saved in localStorage
function restaurarTema() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('btn-tema').textContent = '☀️';
    }
}
// PT: Alterna entre tema claro e escuro
// EN: Toggles between light and dark theme
function toggleTema() {
    const isLight = document.body.classList.toggle('light-mode');
    document.getElementById('btn-tema').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('tema', isLight ? 'light' : 'dark');
}