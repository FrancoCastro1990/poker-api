//import { db } from "../utils/db";

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

import express, { Express } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { db } from "../utils/db";

const app: Express = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});


app.get("/", (req, res) => {
    console.log("Petición recibida");
    res.json({ message: "Hola, mundo!" });
});

function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


app.post("/createGame", async (req, res) => {
    console.log("Petición recibida");
    const game = await db.game.create({
        data: {
            name: generateRandomString(12)
        }
    })
    res.json({ game });
});

app.get("/game/:name", async (req, res) => {
    console.log("Petición recibida");
    const game = await db.game.findUnique({
        where: {
            name: req.params.name
        }
    })
    res.json({ game });
});

interface CardGame {
    selectedCard?: number | null;
    player: string;
}

//TODO: obtener del Game selectedCards y showVotes
const selectedCards: CardGame[] = [];
let showVotes: boolean = false;

io.on("connection", (socket) => {
    console.log("Un cliente se ha conectado");
    console.log(socket.id);
    socket.on("disconnect", () => {
        //imprime el usuario que se desconecta

        console.log(socket.id)
        console.log("Un cliente se ha desconectado");
    });
    socket.on("message", (data: CardGame) => {
        console.log('get message', data);
        const index = selectedCards.findIndex((card) => card.player === data.player);
        if (index !== -1) {
            selectedCards[index].selectedCard = data.selectedCard;
        } else {
            selectedCards.push(data);
        }
        io.emit("message", selectedCards);
    });

    socket.on("removeUser", (data) => {
        console.log('removeUser', data);
        const index = selectedCards.findIndex((card) => card.player === data.name);
        if (index !== -1) {
            selectedCards.splice(index, 1);
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


