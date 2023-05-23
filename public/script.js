// new item({ x: 100, y: 100, z: 0 }, 20, animation_sheet);

let player = new Player(clientID);

//--------------------------------------------------

function uploadData(data) {
  let numberString = "";
  let points = [];
  let position = { x: 0, y: 0, z: 0 };
  let returnPoint = { x: 0, y: 0, z: 0 };
  let height;
  let currentStyle = "Object";
  let colors = [];

  for (let i = 0; i < data.length; i++) {
    const character = data[i];

    if (currentStyle == "Object") {
      if (
        character !== "O" &&
        character !== "H" &&
        character !== "," &&
        character !== ";" &&
        character !== "x" &&
        character !== "y" &&
        character !== "z"
      ) {
        numberString += character;
      }

      if (character == ",") {
        returnPoint.x = Number(numberString);
        numberString = "";
      }

      if (character == ";") {
        returnPoint.y = Number(numberString);
        numberString = "";
        points.push({ x: returnPoint.x, y: returnPoint.y, z: returnPoint.z });
      }

      if (character == "x") {
        position.x = Number(numberString);
        numberString = "";
      }
      if (character == "y") {
        position.y = Number(numberString);
        numberString = "";
      }
      if (character == "z") {
        position.z = Number(numberString);
        numberString = "";
      }

      if (character == "H") {
        height = Number(numberString);
        numberString = "";
      }
    }

    if (character == "r") {
      colors.push(getRandomColor());
    }
    if (character == "!") {
      colors.push("none");
    }

    if (character == "O") {
      numberString = "";
      new object(
        points,
        { x: position.x, y: position.y, z: position.z },
        height,
        colors
      );
      colors = [];
      points = [];
      currentStyle == "Object";
    }
  }
}

uploadData(MAP);

//--------------------------------------------------
//          Game Object
//--------------------------------------------------

const game = {
  gameID: 0,
  minPlayers: 2,
  playing: false,
  players: players,
  objects: objects,

  render: () => {
    clear(),
      game.objects.forEach((Object) => {
        draw3d(Object);
      });
  },

  collision: () => {
    {
      game.objects.forEach((Object) => {
        if (!Object.isPlayer) {
          CirclevsOBB(player, Object);
        }
      });
    }
  },

  updatePlayers: () => {
    updatePlayerMovement();
  },

  orderObjects: () => {
    orderObjects();
  },

  drawEffects: () => {},
};

player.id = clientID;
player.position.x = 2310;
player.position.y = -15;

//--------------------------------------------------
//          Stress Test
//--------------------------------------------------

let size = 0;

for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    for (let k = 0; k < size; k++) {
      new object(
        [
          { x: -20, y: 20, z: 0 },

          { x: -20, y: -30, z: 0 },

          { x: 30, y: -30, z: 0 },

          { x: 30, y: 20, z: 0 },
          { x: -20, y: 20, z: 0 },
        ],
        { x: i * 100, y: j * 100, z: k * 100 },
        30
      );
    }
  }
}

//--------------------------------------------------
//          Gameloop
//--------------------------------------------------

function gameLoading() {
  if (connectedIDs.length > 1) {
    document.getElementById("waitingBox").style.display = "none";
    game.playing = true;
  } else {
    document.getElementById("waitingBox").innerHTML =
      "Waiting for players : " + connectedIDs.length + "/2";
    game.orderObjects(); // Orders objects so that they render in the correct order
    game.render(); // Renders objects
  }
}

let oldDate, newDate, deltaT;

function gameLoop() {
  requestAnimationFrame(gameLoop);
  if (oldDate === undefined) {
    oldDate = Date.now();
  }

  newDate = Date.now();

  deltaT = newDate - oldDate;

  if (!game.playing && loggedIn == true) {
    gameLoading();
  }
  if (game.playing && player.id) {
    game.updatePlayers(); // Updates player positions client and server side.
    game.collision(); // Checks for collisions between player and objects
    game.orderObjects(); // Orders objects so that they render in the correct order
    game.render(); // Renders objects

    // draw2d()

    ctx.drawImage(
      gun_sprite,
      Math.floor(shoot_step) * 99.5,
      0,
      99.5,
      138,
      screenWidth / 2 - 100,
      0,
      240,
      240
    );

    healthCount.innerHTML = `Health: ${player.health}`;

    // console.log(player.position.z)

    deltaMouse.x = 0;
    deltaMouse.y = 0;
    resetPlayerAnimation();

    if (justShot == true) {
      shoot_step += (0.1 * deltaT) / 6;
      if (shoot_step > 4) {
        shoot_step = 0;
        justShot = false;
      }
    }
  }

  oldDate = Date.now();
}

gameLoop();
