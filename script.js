const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const menuScreen = document.getElementById("menu-screen");
const editorToolbar = document.getElementById("editor-toolbar");
const hud = document.getElementById("hud");
const levelNameLabel = document.getElementById("level-name");
const toast = document.getElementById("toast");
const jsonInput = document.getElementById("json-input");

const state = {
  mode: "menu",
  keys: {},
  level: null,
  campaign: [],
  currentCampaignIndex: 0,
  editor: {
    objects: [],
    tool: "platform",
    grid: 40
  },
  player: null,
  cameraX: 0
};

function setMode(mode) {
  state.mode = mode;

  if (mode === "menu") {
    menuScreen.classList.remove("hidden");
    editorToolbar.classList.add("hidden");
    hud.classList.add("hidden");
  } else if (mode === "editor") {
    menuScreen.classList.add("hidden");
    editorToolbar.classList.remove("hidden");
    hud.classList.remove("hidden");
    levelNameLabel.textContent = "Level Editor";
  } else if (mode === "play") {
    menuScreen.classList.add("hidden");
    editorToolbar.classList.add("hidden");
    hud.classList.remove("hidden");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 1200);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createLevel(name, spawnX, spawnY, width, objects) {
  return { name, playerSpawnX: spawnX, playerSpawnY: spawnY, width, objects };
}

function makePlayer(x, y) {
  return {
    x,
    y,
    w: 28,
    h: 28,
    vx: 260,
    vy: 0,
    grounded: false,
    prevX: x,
    prevY: y
  };
}

function buildCampaignLevels() {
  return [
    createLevel("Starter Run", 90, 360, 2000, [
      { type: "platform", x: 0, y: 500, w: 340, h: 40 },
      { type: "platform", x: 430, y: 500, w: 200, h: 40 },
      { type: "platform", x: 760, y: 440, w: 180, h: 40 },
      { type: "platform", x: 1040, y: 500, w: 220, h: 40 },
      { type: "platform", x: 1380, y: 420, w: 180, h: 40 },
      { type: "platform", x: 1640, y: 500, w: 220, h: 40 },

      { type: "spike", x: 350, y: 470, w: 70, h: 30 },
      { type: "spike", x: 630, y: 470, w: 70, h: 30 },
      { type: "spike", x: 960, y: 470, w: 70, h: 30 },
      { type: "spike", x: 1270, y: 470, w: 70, h: 30 },
      { type: "spike", x: 1560, y: 470, w: 70, h: 30 },

      { type: "goal", x: 1860, y: 430, w: 40, h: 70 }
    ]),

    createLevel("Bounce Course", 90, 360, 2200, [
      { type: "platform", x: 0, y: 500, w: 240, h: 40 },
      { type: "platform", x: 320, y: 470, w: 170, h: 40 },
      { type: "platform", x: 560, y: 420, w: 180, h: 40 },
      { type: "platform", x: 820, y: 360, w: 170, h: 40 },
      { type: "platform", x: 1080, y: 500, w: 180, h: 40 },
      { type: "platform", x: 1340, y: 440, w: 160, h: 40 },
      { type: "platform", x: 1580, y: 360, w: 190, h: 40 },
      { type: "platform", x: 1820, y: 500, w: 260, h: 40 },

      { type: "spike", x: 245, y: 470, w: 60, h: 30 },
      { type: "spike", x: 490, y: 470, w: 60, h: 30 },
      { type: "spike", x: 744, y: 470, w: 60, h: 30 },
      { type: "spike", x: 998, y: 470, w: 60, h: 30 },
      { type: "spike", x: 1505, y: 470, w: 60, h: 30 },
      { type: "spike", x: 1765, y: 470, w: 60, h: 30 },

      { type: "goal", x: 2100, y: 430, w: 40, h: 70 }
    ]),

    createLevel("Sky Sprint", 90, 360, 2400, [
      { type: "platform", x: 0, y: 500, w: 220, h: 40 },
      { type: "platform", x: 280, y: 440, w: 160, h: 40 },
      { type: "platform", x: 520, y: 380, w: 140, h: 40 },
      { type: "platform", x: 760, y: 500, w: 180, h: 40 },
      { type: "platform", x: 1030, y: 430, w: 170, h: 40 },
      { type: "platform", x: 1290, y: 360, w: 160, h: 40 },
      { type: "platform", x: 1520, y: 500, w: 220, h: 40 },
      { type: "platform", x: 1810, y: 430, w: 150, h: 40 },
      { type: "platform", x: 2020, y: 500, w: 260, h: 40 },

      { type: "spike", x: 220, y: 470, w: 60, h: 30 },
      { type: "spike", x: 455, y: 470, w: 60, h: 30 },
      { type: "spike", x: 700, y: 470, w: 60, h: 30 },
      { type: "spike", x: 945, y: 470, w: 60, h: 30 },
      { type: "spike", x: 1210, y: 470, w: 60, h: 30 },
      { type: "spike", x: 1755, y: 470, w: 60, h: 30 },

      { type: "goal", x: 2280, y: 430, w: 40, h: 70 }
    ])
  ];
}

state.campaign = buildCampaignLevels();

function resetPlayer(level) {
  state.player = makePlayer(level.playerSpawnX, level.playerSpawnY);
  state.cameraX = 0;
}

function startLevel(level) {
  state.level = level;
  state.mode = "play";
  resetPlayer(level);
  levelNameLabel.textContent = level.name;
  hud.classList.remove("hidden");
}

function startCampaign() {
  const nextLevel = state.campaign[state.currentCampaignIndex];
  startLevel(nextLevel);
}

function nextCampaignLevel() {
  state.currentCampaignIndex = (state.currentCampaignIndex + 1) % state.campaign.length;
  startLevel(state.campaign[state.currentCampaignIndex]);
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function createDefaultEditorLevel() {
  return {
    name: "MyCustomLevel",
    width: 2000,
    playerSpawnX: 80,
    playerSpawnY: 360,
    objects: [
      { type: "platform", x: 0, y: 500, w: 260, h: 40 },
      { type: "goal", x: 1700, y: 430, w: 40, h: 70 }
    ]
  };
}

function startEditor() {
  state.editor.objects = createDefaultEditorLevel().objects;
  state.level = null;
  setMode("editor");
}

function exportLevelToJson() {
  const levelData = {
    name: "MyCustomLevel",
    projectId: "gdclone6243diojciuefvhi0eo",
    playerSpawnX: 80,
    playerSpawnY: 360,
    width: 2000,
    objects: state.editor.objects
  };

  const blob = new Blob([JSON.stringify(levelData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gdclone6243diojciuefvhi0eo-level.json";
  a.click();
  URL.revokeObjectURL(url);

  showToast("Level exported!");
}

function loadImportedLevel(data) {
  const objects = Array.isArray(data.objects) ? data.objects : [];
  const level = {
    name: data.name || "Imported Level",
    playerSpawnX: Number(data.playerSpawnX ?? 80),
    playerSpawnY: Number(data.playerSpawnY ?? 360),
    width: Number(data.width ?? 2000),
    objects
  };

  state.level = level;
  state.mode = "play";
  resetPlayer(level);
  levelNameLabel.textContent = level.name;
  menuScreen.classList.add("hidden");
  editorToolbar.classList.add("hidden");
  hud.classList.remove("hidden");
}

function handleAction(action) {
  if (action === "campaign") {
    startCampaign();
  } else if (action === "editor") {
    startEditor();
  } else if (action === "import") {
    jsonInput.click();
  }
}

function resetCurrentLevel() {
  if (state.level) {
    resetPlayer(state.level);
  }
}

function updatePlayer(dt) {
  if (!state.player || !state.level) return;

  const player = state.player;
  player.prevX = player.x;
  player.prevY = player.y;

  if (state.keys["Space"] || state.keys["ArrowUp"] || state.keys["KeyW"]) {
    if (player.grounded) {
      player.vy = -560;
      player.grounded = false;
    }
  }

  player.vy += 1800 * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;
  player.grounded = false;

  const solids = state.level.objects.filter((obj) => obj.type === "platform");
  const playerBox = { x: player.x, y: player.y, w: player.w, h: player.h };

  for (const solid of solids) {
    if (!rectsIntersect(playerBox, solid)) continue;

    const prevBottom = player.prevY + player.h;
    const prevTop = player.prevY;
    const prevRight = player.prevX + player.w;
    const prevLeft = player.prevX;

    if (player.vy >= 0 && prevBottom <= solid.y + 8) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0 && prevTop >= solid.y + solid.h - 8) {
      player.y = solid.y + solid.h;
      player.vy = 0;
    } else if (player.vx > 0 && prevRight <= solid.x + 8) {
      player.x = solid.x - player.w;
      player.vx = 0;
    } else if (player.vx < 0 && prevLeft >= solid.x + solid.w - 8) {
      player.x = solid.x + solid.w;
      player.vx = 0;
    }
  }

  for (const spike of state.level.objects.filter((obj) => obj.type === "spike")) {
    if (rectsIntersect(playerBox, spike)) {
      resetCurrentLevel();
      showToast("You died!");
      return;
    }
  }

  const goal = state.level.objects.find((obj) => obj.type === "goal");
  if (goal && rectsIntersect(playerBox, goal)) {
    if (state.campaign.includes(state.level)) {
      const index = state.campaign.indexOf(state.level);
      if (index < state.campaign.length - 1) {
        state.currentCampaignIndex = index + 1;
        startLevel(state.campaign[state.currentCampaignIndex]);
        showToast("Level clear!");
      } else {
        showToast("Campaign clear!");
        state.mode = "menu";
        setMode("menu");
      }
    } else {
      showToast("Level complete!");
      state.mode = "menu";
      setMode("menu");
    }
    return;
  }

  if (player.y > canvas.height + 200) {
    resetCurrentLevel();
    showToast("You fell!");
    return;
  }

  state.cameraX = clamp(player.x - 260, 0, Math.max(0, state.level.width - canvas.width));
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#7ad4ff");
  gradient.addColorStop(0.5, "#d9f7ff");
  gradient.addColorStop(1, "#b8f0ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 143 + 30) % (canvas.width + 80);
    const y = (i * 97) % 220;
    ctx.beginPath();
    ctx.arc(x, y, i % 3 === 0 ? 2.2 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlatform(obj) {
  const x = obj.x - state.cameraX;
  ctx.fillStyle = "#32a56d";
  ctx.fillRect(x, obj.y, obj.w, obj.h);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x, obj.y, obj.w, 8);
}

function drawSpike(obj) {
  const x = obj.x - state.cameraX;
  const { y, w, h } = obj;

  ctx.fillStyle = "#f0f0f0";
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff6d7a";
  ctx.beginPath();
  ctx.moveTo(x + 5, y + h - 2);
  ctx.lineTo(x + w / 2, y + 8);
  ctx.lineTo(x + w - 5, y + h - 2);
  ctx.closePath();
  ctx.fill();
}

function drawGoal(obj) {
  const x = obj.x - state.cameraX;
  const y = obj.y;
  const { w, h } = obj;

  ctx.fillStyle = "#ffd166";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#fff3c2";
  ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
  ctx.strokeStyle = "#ffae00";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 10, y + 10, w - 20, h - 20);
}

function drawPlayer(player) {
  const x = player.x - state.cameraX;
  ctx.fillStyle = "#1d2d50";
  ctx.fillRect(x, player.y, player.w, player.h);
  ctx.fillStyle = "#7ae3ff";
  ctx.fillRect(x + 6, player.y + 6, player.w - 12, player.h - 12);
}

function drawEditorGrid() {
  ctx.strokeStyle = "rgba(20, 40, 80, 0.18)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= canvas.width; x += state.editor.grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += state.editor.grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  for (const obj of state.editor.objects) {
    if (obj.type === "platform") {
      ctx.fillStyle = "#32a56d";
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    } else if (obj.type === "spike") {
      ctx.fillStyle = "#ff6d7a";
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y + obj.h);
      ctx.lineTo(obj.x + obj.w / 2, obj.y);
      ctx.lineTo(obj.x + obj.w, obj.y + obj.h);
      ctx.closePath();
      ctx.fill();
    } else if (obj.type === "goal") {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
    }
  }
}

function render() {
  drawBackground();

  if (state.mode === "editor") {
    drawEditorGrid();
    return;
  }

  if (!state.level) return;

  for (const obj of state.level.objects) {
    if (obj.type === "platform") drawPlatform(obj);
    else if (obj.type === "spike") drawSpike(obj);
    else if (obj.type === "goal") drawGoal(obj);
  }

  if (state.player) drawPlayer(state.player);
}

function handleEditorClick(event) {
  if (state.mode !== "editor") return;

  const rect = canvas.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const mouseY = ((event.clientY - rect.top) / rect.height) * canvas.height;

  if (state.editor.tool === "delete") {
    state.editor.objects = state.editor.objects.filter((obj) => !pointInRect(mouseX, mouseY, obj));
    return;
  }

  const snappedX = Math.round(mouseX / state.editor.grid) * state.editor.grid;
  const snappedY = Math.round(mouseY / state.editor.grid) * state.editor.grid;

  let obj = null;

  if (state.editor.tool === "platform") {
    obj = { type: "platform", x: snappedX, y: snappedY, w: 40, h: 40 };
  } else if (state.editor.tool === "spike") {
    obj = { type: "spike", x: snappedX, y: snappedY, w: 40, h: 40 };
  } else if (state.editor.tool === "goal") {
    obj = { type: "goal", x: snappedX, y: snappedY, w: 40, h: 70 };
  }

  if (obj) {
    state.editor.objects.push(obj);
  }
}

window.addEventListener("keydown", (event) => {
  state.keys[event.code] = true;
  if (["Space", "ArrowUp", "KeyW"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  state.keys[event.code] = false;
});

for (const button of document.querySelectorAll("[data-action]")) {
  button.addEventListener("click", () => handleAction(button.dataset.action));
}

document.getElementById("menu-btn").addEventListener("click", () => {
  state.level = null;
  setMode("menu");
});

document.getElementById("retry-btn").addEventListener("click", () => {
  resetCurrentLevel();
});

document.getElementById("editor-back").addEventListener("click", () => {
  state.level = null;
  setMode("menu");
});

document.getElementById("export-json").addEventListener("click", exportLevelToJson);

document.getElementById("playtest").addEventListener("click", () => {
  if (state.editor.objects.length === 0) {
    showToast("Add some objects first");
    return;
  }

  const testLevel = {
    name: "Editor Test",
    playerSpawnX: 80,
    playerSpawnY: 360,
    width: 2000,
    objects: state.editor.objects.slice()
  };

  startLevel(testLevel);
});

jsonInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const parsed = JSON.parse(evt.target.result);
      loadImportedLevel(parsed);
      showToast("Custom level loaded!");
    } catch (error) {
      showToast("Invalid JSON");
    }
  };
  reader.readAsText(file);
  jsonInput.value = "";
});

for (const btn of document.querySelectorAll(".tool")) {
  btn.addEventListener("click", () => {
    state.editor.tool = btn.dataset.tool;
    document.querySelectorAll(".tool").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
}

canvas.addEventListener("mousedown", handleEditorClick);

let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000 || 0.016, 0.024);
  lastTime = timestamp;

  if (state.mode === "play") {
    updatePlayer(dt);
  }

  render();
  requestAnimationFrame(gameLoop);
}

setMode("menu");
requestAnimationFrame(gameLoop);
