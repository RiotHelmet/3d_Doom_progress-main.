canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas_2d = document.getElementById("canvas_2D_map");
ctx_2d = canvas_2d.getContext("2d");
ctx.imageSmoothingEnabled = false;

ctx_2d.translate(canvas_2d.width / 2, canvas_2d.height / 2);

ctx.transform(1, 0, 0, -1, 0, canvas.height);

let settingsMenu = document.getElementById("settingsMenu");
let healthCount = document.getElementById("healthCount");

let objects = [];
let players = [];

keys = [];

let spawns = [
  { x: 2317.5264809749533, y: -2260.54091830296, z: 25 },
  { x: 260.9703248133034, y: -1834.898862809034, z: 13 },
  { x: 244.1184712276995, y: -39.51076666752104, z: 25 },
  { x: 1230.3634873248357, y: -1048.2174093168937, z: 105 },
  { x: 1933.549550144629, y: -2668.4944284335106, z: 205 },
  { x: 2270.827121451108, y: -79.39841894203228, z: -5 },
  { x: 1242.639191505523, y: 769.6781308091167, z: 25 },
];

screenWidth = canvas.width;
screenHeight = canvas.height;

mapScale = 3;

deltaMouse = { x: 0, y: 0 };

shoot_step = 0;
justShot = false;

leaderboard;
