const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: "/real-time",
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  // "joinGame" listener
  socket.on("joinGame", (user) => {
    if (db.players.find(p => p.nickname === user.nickname)) {
      socket.emit("userExists", { message: "¡El usuario ya existe!" });
      return;
    }
    db.players.push({ ...user, id: socket.id });
    io.emit("userJoined", { players: db.players });

    if (db.players.length >= 3) {
      io.emit("canStartGame", true);
    }
  });

  // "startGame" listener
  socket.on("startGame", () => {
    if (db.players.length >= 3) {
      db.gameStarted = true;
      const roles = assignRoles(db.players);
      db.roles = roles;
      io.emit("gameStarted", roles);
    }
  });

  // "marco" listener
  socket.on("marco", () => {
    if (db.roles[socket.id] === 'marco') {
      io.emit("marcoTrin");
    }
  });

  // "polo" listener
  socket.on("polo", () => {
    if (db.roles[socket.id] === 'polo' || db.roles[socket.id] === 'specialPolo') {
      io.emit("poloTrin", { playerID: socket.id });
    }
  });

  // "selectPolo" listener
  socket.on("selectPolo", (poloId) => {
    if (db.roles[socket.id] === 'marco') {
      if (db.roles[poloId] === 'specialPolo') {
        io.emit("gameEnd");
      } else {
        const marco = db.players.find(p => p.id === socket.id);
        const polo = db.players.find(p => p.id === poloId);
        db.roles[socket.id] = 'polo';
        db.roles[poloId] = 'marco';
        io.emit("roleChanged", { marco: marco.nickname, polo: polo.nickname });
      }
    }
  });
});

function assignRoles(players) {
  const roles = {};
  const shuffled = players.sort(() => 0.5 - Math.random());
  roles[shuffled[0].id] = 'marco';
  shuffled.slice(1).forEach((player, index) => {
    roles[player.id] = index === shuffled.length - 2 ? 'specialPolo' : 'polo';
  });
  return roles;
}

httpServer.listen(5050, () => {
  console.log(`Server is running on http://localhost:5050`);
});
