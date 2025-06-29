const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const audio = new Audio("music/trotil.mp3");
audio.volume = 0.3;
let leftKey = localStorage.getItem("leftKey") || "a";
let middleKey = localStorage.getItem("middleKey") || "s";
let rightKey = localStorage.getItem("rightKey") || "l";

let chart = [];
let score = 0;
let notes = [];
let startTime = 0;


// Quand l'utilisateur bouge le slider, on change le volume et on met à jour le texte

fetch("chart.json")
  .then((res) => res.json())
  .then((data) => {
    chart = data;
    setTimeout(() => {
      audio.play();
      startTime = performance.now();
      requestAnimationFrame(gameLoop);
    }, 1000); // petit d�lai de synchro
  });

  
  function spawnNote(noteData) {
    const el = document.createElement("div");
    el.classList.add("note");
  
    // Déterminer le côté (gauche ou droite)
    if (noteData.side === "left") {
      el.classList.add("left");
      el.style.left = "20px";
    } else if (noteData.side === "middle") {
      el.classList.add("middle");
    } else if (noteData.side === "right") {
      el.classList.add("right");
      el.style.left = "calc(100% - 70px)";
    }
  
    el.dataset.time = noteData.time;
    gameArea.appendChild(el);
    notes.push(el);
  }
  const timerDiv = document.getElementById("timer");

function updateTimer() {
  const elapsed = performance.now() - startTime; // temps écoulé en ms

  // Convertir en minutes, secondes, millisecondes
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const milliseconds = Math.floor(elapsed % 1000);

  // Formatage type "mm:ss.mmm"
  const formatted = 
    String(minutes).padStart(2, '0') + ":" +
    String(seconds).padStart(2, '0') + "." +
    String(milliseconds).padStart(3, '0');

  timerDiv.textContent = formatted;

  requestAnimationFrame(updateTimer); // rappeler à chaque frame pour update
}

  function gameLoop() {
    const currentTime = performance.now() - startTime;
    const travelTime = 1250; // Durée en ms qu'une note met à atteindre la ligne
    const hitLineY = 430;    // Position Y de la ligne de frappe
  
    chart.forEach((note) => {
      if (!note.spawned && currentTime >= note.time - travelTime) {
        spawnNote(note);
        note.spawned = true;
      }
    });
  
    notes.forEach((note, index) => {
      const noteTime = parseFloat(note.dataset.time);
      const delta = noteTime - currentTime;
      const progress = 1 - (delta / travelTime);
      const y = progress * hitLineY;
  
      note.style.top = `${y}px`;
  
      // Supprimer la note si elle est passée depuis longtemps
      if (y > hitLineY + 150) {
        gameArea.removeChild(note);
        notes.splice(index, 1);
      }
    });
  
    requestAnimationFrame(gameLoop);
  }
  
  startTime = performance.now();
  updateTimer(); // lance la mise à jour du timer
  requestAnimationFrame(gameLoop);
  
document.addEventListener("keydown", (e) => {
  const currentTime = performance.now() - startTime;

  let side = null;

  if (e.key === leftKey) {
    side = "left";
  } else if (e.key === middleKey) {
    side = "middle";
  } else if (e.key === rightKey) {
    side = "right";
  }
  

    const hit = notes.find((note) => {
      const noteTime = parseFloat(note.dataset.time);
      const isCorrectSide = note.classList.contains(side);
      return isCorrectSide && Math.abs(noteTime - currentTime) < 230;
    });

    if (hit) {
      gameArea.removeChild(hit);
      notes = notes.filter((n) => n !== hit);
      score += 100;
      scoreDisplay.textContent = `Score : ${score}`;
    }
  }
);

