const prisma = require("../data/prisma");

const listar = async (req, res) => {
    const { usuarioId } = req.query;

    const eventos = await prisma.evento.findMany({
        where: usuarioId ? { usuarioId: Number(usuarioId) } : {},
        include: {
            usuario: true
        }
    });

    return res.status(200).json(eventos);
};

const cadastrar = async (req, res) => {
    const data = req.body;

    const evento = await prisma.evento.create({
        data: {
            cidade: data.cidade,
            tipoEvento: data.tipoEvento,
            temperaturaMaxima: data.temperaturaMaxima == null || data.temperaturaMaxima === ""
                ? null : Number(data.temperaturaMaxima),
            data: data.data ? new Date(data.data) : undefined,
            nivelImpacto: data.nivelImpacto,
            usuarioId: Number(data.usuarioId)
        }
    });

    return res.status(201).json(evento);
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    const evento = await prisma.evento.update({
        where: { id: Number(id) },
        data: {
            cidade: data.cidade,
            tipoEvento: data.tipoEvento,
            temperaturaMaxima: data.temperaturaMaxima == null || data.temperaturaMaxima === ""
                ? null : Number(data.temperaturaMaxima),
            data: data.data ? new Date(data.data) : undefined,
            nivelImpacto: data.nivelImpacto,
            usuarioId: Number(data.usuarioId)
        }
    });

    return res.status(200).json(evento);
};

const excluir = async (req, res) => {
    const { id } = req.params;

    const evento = await prisma.evento.delete({
        where: { id: Number(id) }
    });

    return res.status(200).json(evento);
};

module.exports = {
    cadastrar,
    listar,
    atualizar,
    excluir
};
