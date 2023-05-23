const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const crypto = require("crypto");
const mysql = require("mysql");

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

let connectedIds = [];

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

class playerInfo {
  kills = 0;
  username;
  constructor(_ID, _username) {
    this.ID = _ID;
    this.username = _username;
  }
}

// connection

let players = [];

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "shooterDatabase",
});

app.get("/editor", function (req, res) {
  res.sendFile(__dirname + "/public/Editor/index.html");
});

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(express.static(__dirname + "/public"));

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");

  io.sockets.on("connection", (socket) => {
    console.log(`⚡ : A user has connected : ${socket.id}`);
    con.query(
      `
        SELECT * FROM
          userdata
        `,
      function (err, result, fields) {
        if (err) throw err;
        io.emit("updateLeaderboard", { res: result, id: socket.id });
      }
    );

    // Request Player info, position etc.
    socket.on("requestPlayerInformation_Server", (data) => {
      console.log("Request : ", data.sender);
      io.emit("requestPlayerinformation_Client", data);
    });
    socket.on("recievePlayerInformation_Server", (data) => {
      console.log("Recieved from ", data.id);
      io.emit("recievePlayerInformation_Client", data);
    });

    // Update Player Position
    socket.on("updatePlayerPosition", (data) => {
      io.emit("sendPlayerPosition", data);
    });

    socket.on("playerKilled", (data) => {
      let KILLER;
      let KILLED;
      players.forEach((Player) => {
        if (Player.ID == data.shooterID) {
          Player.kills++;
          KILLER = Player.username;
          console.log(Player.username);

          con.query(
            `
              SELECT * FROM
                userdata
          
              WHERE username = '${Player.username}'
              `,
            function (err, result, fields) {
              if (err) throw err;
              if (result[0]) {
                console.log(result[0].kills);
                con.query(
                  `
                    UPDATE userdata
          
                    SET kills = ${result[0].kills + 1}
                
                    WHERE username = '${Player.username}'
                    `,
                  function (err, result, fields) {
                    if (err) throw err;
                  }
                );
              }
            }
          );
        }
      });

      players.forEach((Player) => {
        if (Player.ID == data.ID) {
          KILLED = Player.username;
        }
      });

      io.emit("alert", `${KILLER} KILLED ${KILLED}`);
    });

    socket.on("raycastHIT", (data) => {
      io.emit("damagePlayer", data);
    });

    socket.on("loginRequest", (data) => {
      console.log(data);

      for (let i = 0; i < players.length; i++) {
        if (players[i].username == data.username) {
          return false;
        }
      }
      con.query(
        `
          SELECT * FROM
            userdata
      
          WHERE username = '${data.username}'
          `,
        function (err, result, fields) {
          if (err) throw err;
          if (result[0]) {
            if (result[0].password == hashPassword(data.password)) {
              connectedIds.push(data.ID);
              io.emit("updateConnections", connectedIds);
              console.log(connectedIds);

              players.push(new playerInfo(data.ID, data.username));

              io.emit("login", {
                userID: result[0].userID,
                username: data.username,
                ID: data.ID,
              });
              console.log("Login successful");
            } else {
              console.log("Login failed");
            }
          }
        }
      );
    });

    socket.on("disconnect", () => {
      console.log(`️‍🔥 : A user has disconnect : ${socket.id}`);
      connectedIds.splice(connectedIds.indexOf(socket.id), 1);
      io.emit("updateConnections", connectedIds);
      io.emit("disconnect_client", socket.id);
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
