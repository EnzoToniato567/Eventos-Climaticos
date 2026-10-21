const formEvento = document.getElementById("formEvento");
const listaEventos = document.getElementById("listaEventos");
const mensagemLista = document.getElementById("mensagemLista");
const mensagemForm = document.getElementById("mensagemForm");
const baseUrl = "http://localhost:3000";

let usuario;
let eventoEmEdicao = null;

try {
    usuario = JSON.parse(sessionStorage.getItem("usuario"));
} catch {
    usuario = null;
}

if (!usuario || !usuario.id || !usuario.nome) {
    sessionStorage.removeItem("usuario");
    location.replace("index.html");
} else {
    document.getElementById("nomeUsuario").textContent = usuario.nome;
    document.getElementById("sair").addEventListener("click", () => {
        sessionStorage.removeItem("usuario");
        location.replace("index.html");
    });
    document.getElementById("cancelar").addEventListener("click", limparFormulario);
    formEvento.addEventListener("submit", salvarEvento);
    carregarEventos();
}

async function respostaApi(url, opcoes) {
    const resposta = await fetch(baseUrl + url, opcoes);
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) throw new Error(dados.erro || "Erro ao acessar a API.");
    return dados;
}

async function carregarEventos() {
    mensagemLista.textContent = "Carregando eventos...";
    mensagemLista.classList.remove("erro", "sucesso");

    try {
        const eventos = await respostaApi(`/eventos/listar?usuarioId=${usuario.id}`);
        eventos.sort((a, b) => new Date(b.data) - new Date(a.data));
        mostrarEventos(eventos);
        mensagemLista.textContent = eventos.length ? "" : "Nenhum evento cadastrado.";
        return true;
    } catch (erro) {
        mensagemLista.textContent = erro.message || "Não foi possível carregar os eventos.";
        mensagemLista.classList.add("erro");
        return false;
    }
}

function mostrarEventos(eventos) {
    listaEventos.replaceChildren();

    for (const evento of eventos) {
        const cartao = document.createElement("article");
        cartao.className = "evento";

        const titulo = document.createElement("h3");
        titulo.textContent = `${evento.cidade} · ${evento.tipoEvento}`;

        const data = document.createElement("p");
        data.textContent = `Data: ${new Date(evento.data).toLocaleString("pt-BR")}`;

        const temperatura = document.createElement("p");
        temperatura.textContent = evento.temperaturaMaxima == null
            ? "Temperatura máxima: não informada"
            : `Temperatura máxima: ${evento.temperaturaMaxima} °C`;

        const impacto = document.createElement("p");
        impacto.textContent = `Impacto: ${evento.nivelImpacto}`;

        const acoes = document.createElement("div");
        acoes.className = "acoes";

        const editar = document.createElement("button");
        editar.type = "button";
        editar.className = "secundario";
        editar.textContent = "Editar";
        editar.addEventListener("click", () => editarEvento(evento));

        const excluir = document.createElement("button");
        excluir.type = "button";
        excluir.className = "secundario";
        excluir.textContent = "Excluir";
        excluir.addEventListener("click", () => excluirEvento(evento.id));

        acoes.append(editar, excluir);
        cartao.append(titulo, data, temperatura, impacto, acoes);
        listaEventos.appendChild(cartao);
    }
}

function dataParaFormulario(valor) {
    const data = new Date(valor);
    const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function editarEvento(evento) {
    eventoEmEdicao = evento.id;
    document.getElementById("cidade").value = evento.cidade;
    document.getElementById("tipoEvento").value = evento.tipoEvento;
    document.getElementById("temperaturaMaxima").value = evento.temperaturaMaxima ?? "";
    document.getElementById("data").value = dataParaFormulario(evento.data);
    document.getElementById("nivelImpacto").value = evento.nivelImpacto;
    document.getElementById("tituloForm").textContent = "Editar evento";
    document.getElementById("salvar").textContent = "Salvar alterações";
    document.getElementById("cancelar").hidden = false;
    mensagemForm.textContent = "";
    mensagemForm.classList.remove("erro", "sucesso");
    formEvento.scrollIntoView({ behavior: "smooth" });
}

function limparFormulario() {
    formEvento.reset();
    eventoEmEdicao = null;
    document.getElementById("tituloForm").textContent = "Novo evento";
    document.getElementById("salvar").textContent = "Cadastrar evento";
    document.getElementById("cancelar").hidden = true;
    mensagemForm.textContent = "";
    mensagemForm.classList.remove("erro", "sucesso");
}

async function salvarEvento(event) {
    event.preventDefault();
    mensagemForm.textContent = "";
    mensagemForm.classList.remove("erro", "sucesso");

    const cidade = document.getElementById("cidade").value.trim();
    const tipoEvento = document.getElementById("tipoEvento").value.trim();
    const nivelImpacto = document.getElementById("nivelImpacto").value.trim();
    const temperatura = document.getElementById("temperaturaMaxima").value;
    const data = document.getElementById("data").value;

    if (!cidade || !tipoEvento || !nivelImpacto) {
        mensagemForm.textContent = "Preencha cidade, tipo e impacto.";
        mensagemForm.classList.add("erro");
        return;
    }

    const dados = {
        usuarioId: Number(usuario.id),
        cidade,
        tipoEvento,
        temperaturaMaxima: temperatura === "" ? null : Number(temperatura),
        nivelImpacto
    };
    if (data) dados.data = new Date(data).toISOString();

    const editando = eventoEmEdicao !== null;
    const url = editando ? `/eventos/atualizar/${eventoEmEdicao}` : "/eventos/cadastrar";
    const botao = document.getElementById("salvar");
    botao.disabled = true;

    try {
        await respostaApi(url, {
            method: editando ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        limparFormulario();
        mensagemForm.textContent = editando ? "Evento atualizado." : "Evento cadastrado.";
        mensagemForm.classList.add("sucesso");
        await carregarEventos();
    } catch (erro) {
        mensagemForm.textContent = erro.message || "Não foi possível salvar o evento.";
        mensagemForm.classList.remove("sucesso");
        mensagemForm.classList.add("erro");
    } finally {
        botao.disabled = false;
    }
}

async function excluirEvento(id) {
    if (!confirm("Excluir este evento?")) return;

    try {
        await respostaApi(`/eventos/excluir/${id}`, { method: "DELETE" });
        if (eventoEmEdicao === id) limparFormulario();
        if (await carregarEventos()) {
            mensagemLista.textContent = "Evento excluído.";
            mensagemLista.classList.add("sucesso");
        }
    } catch (erro) {
        mensagemLista.textContent = erro.message || "Não foi possível excluir o evento.";
        mensagemLista.classList.remove("sucesso");
        mensagemLista.classList.add("erro");
    }
}
