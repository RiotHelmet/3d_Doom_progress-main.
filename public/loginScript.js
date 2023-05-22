var socket = io();

loginPage = document.getElementById("loginMenu");
loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  username = document.getElementById("unameInput").value;
  password = document.getElementById("pwordInput").value;

  if (username && password) {
    socket.emit("loginRequest", {
      username: username,
      password: password,
      ID: clientID,
    });
  }
});

// window.location.href = "someOtherFile.html";

socket.on("login", (data) => {
  if (data.ID == clientID) {
    // document.cookie = data.userID;
    game.playing = true;

    player.id = clientID;
    player.data.userId = data.userId;
    player.data.username = data.username;

    document.getElementById("username").innerHTML = player.data.username;

    connectedIDs.forEach((ID) => {
      if (ID !== clientID && ID !== connectedIDs[connectedIDs.length - 1]) {
        new Player(ID, data.userID, data.username);
      }
    });

    socket.emit("requestPlayerInformation_Server", { sender: clientID });

    document.getElementById("leaderboard").style.display = "flex";
    loginPage.style.display = "none";
  }
});
