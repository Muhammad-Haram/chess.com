const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

let chess = new Chess()
const players = {};
const currentPlayer = "W";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.render("index", { title: "Chess Game" })
});

io.on("connection", function (uniqueSocket) {
    console.log("connected");


    if (!players.white) {
        players.white = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "w")
    } else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "b");
    } else {
        uniqueSocket.emit("spectatorRole");
    };

    uniqueSocket.on("disconnect", function () {

        if (uniqueSocket.id === players.white) {
            delete players.white;
        } else if (uniqueSocket.id === players.black) {
            delete players.black;
        }

    });

    uniqueSocket.on("move", (move) => {
        try {

            if (chess.turn() === "w" && players.white === uniqueSocket.id) return;
            if (chess.turn() === "b" && players.black === uniqueSocket.id) return;


        } catch (error) {
            console.log(error.message);
        }
    })


})

server.listen(3000, function () {
    console.log("Listening on http://localhost:3000");
});