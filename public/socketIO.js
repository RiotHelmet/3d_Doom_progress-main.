let clientID;

let connectedIDs;

socket.on("connect", () => {
  clientID = socket.id;
});

socket.on("damagePlayer", (data) => {
  if (player.id == data.ID) {
    player.health -= 50;
    if (player.health <= 0) {
      socket.emit("playerKilled", data);

      let spawnPosition = spawns[Math.round(Math.random() * spawns.length)];

      player.position = {
        x: spawnPosition.x,
        y: spawnPosition.y,
        z: spawnPosition.z,
      };
      updatePlayerPosition();
      player.health = 100;
    }
  }
});

socket.on("disconnect_client", (ID) => {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == ID) {
      objects.splice(objects.indexOf(players[i].shape), 1);

      players.splice(i, 1);
    }
  }
});

let wait;

socket.on("alert", (message) => {
  if (wait) {
    clearTimeout(wait);
  }

  const element = document.getElementById("alertBox");

  element.innerHTML = `${message}`;

  element.classList.remove("animate");
  element.style.opacity = 1;
  void element.offsetWidth;
  element.style.display = "block";
  element.classList.add("animate");

  wait = setTimeout(() => {
    element.style.display = "none";
  }, 5000);
});

socket.on("updateConnections", (connectionArray) => {
  connectedIDs = connectionArray;
  if (
    connectedIDs[connectedIDs.length - 1] !== clientID &&
    connectedIDs[connectedIDs.length - 1] !== undefined
  ) {
    let bool = false;

    players.forEach((player) => {
      if (player.id == connectedIDs[connectedIDs.length - 1]) {
        bool = true;
      }
    });
    // if(bool) {
    new Player(connectedIDs[connectedIDs.length - 1]);
    // }
  }
});

function updatePlayerPosition() {
  socket.emit("updatePlayerPosition", {
    ID: clientID,
    position: player.position,
    rotation: player.rotation,
  });
}

socket.on("sendPlayerPosition", function (data) {
  if (data.ID !== clientID) {
    updateOtherPlayers(data.ID, data.position, data.rotation);
  }
});

socket.on("updateLeaderboard", function (data) {
  if (data.id == clientID) {
    let results = data.res;

    for (let i = 0; i < results.length - 1; i++) {
      for (let j = 0; j < results.length - i - 1; j++) {
        if (results[j].kills < results[j + 1].kills) {
          let st = results[j];
          results[j] = results[j + 1];
          results[j + 1] = st;
        }
      }
    }

    for (let i = 0; i < 10; i++) {
      if (results[i]) {
        const result = results[i];
        document.getElementById("leaderboard").innerHTML += `
        <div class="leaderboardSlot">${result.username} : ${result.kills} kills</div>
        `;
      }
    }
  }
});

socket.on("requestPlayerinformation_Client", (data) => {
  if (data.sender !== clientID) {
    socket.emit("recievePlayerInformation_Server", {
      position: player.position,
      rotation: player.rotation,
      id: clientID,
      sender: data.sender,
    });
  }
});

socket.on("recievePlayerInformation_Client", (data) => {
  for (let i = 0; i < players.length; i++) {
    const Player = players[i];
    if (Player.id == data.id) {
      Player.position = data.position;
      Player.rotation = data.rotation;
      Player.shape.position = data.position;
      break;
    }
  }
});

function updateOtherPlayers(ID, position, rotation) {
  for (let i = 0; i < players.length; i++) {
    if (players[i].id == ID) {
      if (position.x !== players[i].position.x) {
        players[i].animation.walking = true;
        players[i].animation.idle = false;
        players[i].animation.walking_step += 0.05;
        if (players[i].animation.walking_step > 4) {
          players[i].animation.walking_step = 0;
        }
      }
      players[i].position = position;
      players[i].rotation = rotation;
      players[i].shape.position = players[i].position;
    }
  }
}

function resetPlayerAnimation() {
  players.forEach((Player) => {
    Player.animation.idle = true;
    Player.animation.walking = false;
    Player.animation.shooting = false;
  });
}
