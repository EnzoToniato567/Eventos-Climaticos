const formLogin = document.getElementById("formLogin");
const mensagemLogin = document.getElementById("mensagemLogin");
const baseUrl = "http://localhost:3000";

if (sessionStorage.getItem("usuario")) {
    location.replace("home.html");
}

formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensagemLogin.textContent = "";
    mensagemLogin.classList.remove("erro");

    const botao = formLogin.querySelector("button");
    botao.disabled = true;

    try {
        const resposta = await fetch(`${baseUrl}/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: formLogin.elements.email.value.trim(),
                senha: formLogin.elements.senha.value
            })
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(dados.erro || "Não foi possível entrar.");
        }

        sessionStorage.setItem("usuario", JSON.stringify({
            id: dados.id,
            nome: dados.nome,
            email: dados.email
        }));
        location.href = "home.html";
    } catch (erro) {
        mensagemLogin.classList.add("erro");
        mensagemLogin.textContent = erro instanceof TypeError
            ? "Não foi possível conectar à API. Inicie o servidor na porta 3000."
            : erro.message;
    } finally {
        botao.disabled = false;
    }
});
