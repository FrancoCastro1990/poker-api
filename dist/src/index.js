"use strict";
//import { db } from "../utils/db";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// (async () => {
//     try {
//         const player1 = await db.player.create({
//             data: {
//                 name: 'usuario3'
//             }
//         });
//         const player2 = await db.player.create({
//             data: {
//                 name: 'usuario4'
//             }
//         });
//         console.log(player1, player2);
//     } catch (error) {
//         console.error(error);
//     }
// })();
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const db_1 = require("../utils/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
app.get("/", (req, res) => {
    console.log("Petición recibida");
    res.json({ message: "Hola, mundo!" });
});
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
app.post("/createGame", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Petición recibida");
    const game = yield db_1.db.game.create({
        data: {
            name: generateRandomString(12)
        }
    });
    res.json({ game });
}));
app.get("/game/:name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Petición recibida");
    const game = yield db_1.db.game.findUnique({
        where: {
            name: req.params.name
        }
    });
    res.json({ game });
}));
//TODO: obtener del Game selectedCards y showVotes
const selectedCards = [];
let showVotes = false;
io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado");
    socket.on("disconnect", (data) => {
        console.log(data);
        console.log("Un cliente se ha desconectado");
    });
    socket.on("message", (data) => {
        console.log('get message', data);
        const index = selectedCards.findIndex((card) => card.player === data.player);
        if (index !== -1) {
            selectedCards[index].selectedCard = data.selectedCard;
        }
        else {
            selectedCards.push(data);
        }
        io.emit("message", selectedCards);
    });
    socket.on("showVotes", (data) => {
        showVotes = data;
        console.log("showVotes", showVotes);
        io.emit("showVotes", showVotes);
    });
    socket.on("clearAllVotes", (data) => {
        selectedCards.forEach((card) => {
            card.selectedCard = null;
        });
        io.emit("message", selectedCards);
        io.emit("clearAllVotes");
    });
});
app.get("/showVotes", (req, res) => {
    console.log("Petición recibida");
    res.json({ showVotes });
});
app.get("/cards", (req, res) => {
    console.log("Petición recibida");
    res.json({ cards: selectedCards });
});
server.listen(8080, () => {
    console.log("Servidor iniciado en el puerto 8080");
});
//# sourceMappingURL=index.js.map