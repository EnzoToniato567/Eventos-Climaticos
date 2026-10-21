require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("node:path");

const app = express();

app.use(express.json());
app.use(cors());

const usuarioRoutes = require("./src/routes/usuarios.routes");
const eventoRoutes = require("./src/routes/eventos.routes");

app.use("/usuarios", usuarioRoutes);
app.use("/eventos", eventoRoutes);
app.use(express.static(path.join(__dirname, "../web")));

const porta = process.env.PORT || 3000;

app.listen(porta, () => {
    console.log(`Online em http://localhost:${porta}`);
});
