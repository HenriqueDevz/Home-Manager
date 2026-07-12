// PT: Abre o modal de trocar senha e limpa os campos
// EN: Opens the change password modal and clears the fields
function abrirTrocarSenha () {
    document.getElementById('modal-senha').style.display = 'flex';
    document.getElementById('senha-atual').value = '';
    document.getElementById('nova-senha').value = '';
    document.getElementById('senha-confirma').value = '';
    document.getElementById('senha-erro').textContent = '';
    document.getElementById('senha-sucesso').textContent = '';
}
// PT: Fecha o modal de trocar senha
// EN: Closes the change password modal
function fecharTrocarSenha() {
    document.getElementById('modal-senha').style.display = 'none';
}
// PT: Realiza o logout do usuário e redireciona para o login
// EN: Logs the user out and redirects to login
async function logout() {
    await fetch('/auth/logout', {method: 'POST' });
    localStorage.removeItem('username');
    window.location.href = '/';
}
// PT: Valida os campos e envia a requisição de trocar senha
// EN: Validates the fields and sends the change password request
async function trocarSenha() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirma = document.getElementById('senha-confirma').value;
    const erroDiv = document.getElementById('senha-erro');
    const sucessoDiv = document.getElementById('senha-sucesso');

    erroDiv.textContent = '';
    sucessoDiv.textContent = '';

    if (novaSenha !== confirma) {
        erroDiv.textContent = 'As senhas não conferem';
        return; 
    }

    try {
        const res = await fetch('/auth/change-password', {
            method: 'PUT',
            headers:{ 'Content-Type': 'application/json' },
            body: JSON.stringify({ senhaAtual, novaSenha })
        });

        const data = await res.json();

        if (!res.ok) {
            erroDiv.textContent = data.error;
            return;
        }

        sucessoDiv.textContent = data.message;

        setTimeout(() => fecharTrocarSenha(), 2000);
    } catch(err) {
        erroDiv.textContent = 'Erro de conexão';
    }
}