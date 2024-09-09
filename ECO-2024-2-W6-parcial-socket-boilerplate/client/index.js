const socket = io("http://localhost:5050", { path: "/real-time" });

document.getElementById("join-button").addEventListener("click", fetchData);

async function fetchData() {
  const nickname = document.getElementById("nickname").value;
  if (nickname) {
    try {
      socket.emit("joinGame", { nickname });
    } catch (error) {
      console.error("Error joining the game:", error);
    }
  }
}

socket.on("userJoined", (data) => {
  console.log("Received data:", data);
  if (data && Array.isArray(data.players)) {
    updatePlayerList(data.players);
    checkCanStartGame(data.players);
  } else {
    console.error("Received data is not valid:", data);
  }
});

function updatePlayerList(players) {
  const playersList = document.getElementById("players");
  playersList.innerHTML = "";
  
  if (Array.isArray(players)) {
    players.forEach(player => {
      const playerDiv = document.createElement("div");
      playerDiv.classList.add("item");
      playerDiv.innerText = player.nickname;
      playersList.appendChild(playerDiv);
    });
  } else {
    console.error("Expected an array of players but got:", players);
  }
}

function checkCanStartGame(players) {
  const canStart = players.length >= 3;
  document.getElementById("start-game").style.display = canStart ? "block" : "none";
}

document.getElementById("start-game").addEventListener("click", () => {
  socket.emit("startGame");
});

socket.on("gameStarted", (roles) => {
  const role = roles[socket.id];
  document.getElementById("roles").innerText = `Your role: ${role}`;
  document.getElementById("roles").style.display = "block";
  
  if (role === "marco") {
    document.getElementById("marco-btn").style.display = "block";
    document.getElementById("polo-btn").style.display = "none";
    displayMessage("Game started! You are Marco.");
  } else {
    document.getElementById("marco-btn").style.display = "none";
    document.getElementById("polo-btn").style.display = "block";
    displayMessage("Game started! You are Polo.");
  }
});

document.getElementById("marco-btn").addEventListener("click", () => {
  socket.emit("marco");
});

document.getElementById("polo-btn").addEventListener("click", () => {
  socket.emit("polo");
});

function displayMessage(message) {
  const dataContainer = document.getElementById("data-container");
  const messageDiv = document.createElement("div");
  messageDiv.innerText = message;
  dataContainer.appendChild(messageDiv);
}
