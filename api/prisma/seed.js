const prisma = require('../src/data/prisma');

async function main() {
    await prisma.$transaction(async (transaction) => {
        await transaction.evento.deleteMany()
        await transaction.usuario.deleteMany()

        const usuarios = await Promise.all([
            transaction.usuario.create({data: {nome:"Usuario um", email:"usuarioum@gmail.com", senha:"senha123"}}),
            transaction.usuario.create({data: {nome:"Usuario dois", email:"usuariodois@gmail.com", senha:"senha123"}}),
            transaction.usuario.create({data: {nome:"Usuario tres", email:"usuariotres@gmail.com", senha:"senha123"}}),
            transaction.usuario.create({data: {nome:"Usuario quatro", email:"usuarioquatro@gmail.com", senha:"senha123"}}),
            transaction.usuario.create({data: {nome:"Usuario cinco", email:"usuariocinco@gmail.com", senha:"senha123"}})
        ]);

        console.log("Usuários cadastrados")

        await Promise.all([
            transaction.evento.create({data: {usuarioId: usuarios[0].id, cidade:"Amparo", tipoEvento:"Tempestade", temperaturaMaxima: 34.2, nivelImpacto: "Derrubada de árvores e detelhamento de edifícios"}}),
            transaction.evento.create({data: {usuarioId: usuarios[1].id, cidade:"Campinas", tipoEvento:"Chuva forte", temperaturaMaxima: 28.5, nivelImpacto: "Alagamentos e deslizamentos de terra"}}),
            transaction.evento.create({data: {usuarioId: usuarios[2].id, cidade:"São Paulo", tipoEvento:"Granizo", temperaturaMaxima: 22.0, nivelImpacto: "Danos a veículos e telhados"}}),
            transaction.evento.create({data: {usuarioId: usuarios[3].id, cidade:"Rio de Janeiro", tipoEvento:"Vento forte", temperaturaMaxima: 30.1, nivelImpacto: "Queda de árvores e interrupção do tráfego"}}),
            transaction.evento.create({data: {usuarioId: usuarios[4].id, cidade:"Belo Horizonte", tipoEvento:"Alagamento", temperaturaMaxima: 25.0, nivelImpacto: "Inundações em áreas residenciais e comerciais"}})
        ])

        console.log("Eventos cadastrados")
    })
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });