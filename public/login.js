let modoLogin = true;

function alternarModo() {
    modoLogin = !modoLogin;

    document.getElementById("titulo").textContent = modoLogin ? " 🏠 Bem-Vindo"   : " 📝 Criar conta";
    document.getElementById("subtitulo").textContent = modoLogin ? "Acesse sua conta para continuar" : "Preencha os dados para se cadastrar";

    document.getElementById("btn-entrar").textContent = modoLogin ? "Entrar" : "Cadastrar";
    document.getElementById("btn-alternar").textContent = modoLogin ? "Não tenho conta? Cadastre-se" : "Já tenho conta? Entrar";

    document.getElementById("erro").textContent = "";
}


function limparCampos() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}
async function submitForm() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const erroDiv = document.getElementById("erro");

    if (!username || !password) {
        erroDiv.textContent = "Preencha usuário e senha.";
        return;
    }

    const rota = modoLogin ? "/auth/login" : "/auth/register";

    try {
        const res = await fetch(rota, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        limparCampos();

        if (!res.ok) {
            erroDiv.textContent = data.error || "Algo deu errado.";
            return;
        }

        if (modoLogin) {
            localStorage.setItem('username', data.username);
            window.location.href = "/dashboard";
        } else {
            alternarModo();
            erroDiv.classList.add("sucesso");
            erroDiv.textContent = "Conta criada ! Faça login.";
        }
    } catch (error) {
        console.log("Erro no catch:", err);
        erroDiv.textContent = "Erro de conexão. Tente novamente.";
    }
}

document.getElementById("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitForm();
});