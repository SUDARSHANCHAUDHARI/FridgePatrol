"use strict";

const STORAGE_KEYS = {
  openings: "fridgePatrol.openings",
  sound: "fridgePatrol.sound",
};

const fridgeZone = document.querySelector("#fridge-zone");
const fridgeDoor = document.querySelector("#fridge-door");
const fridgeHandle = document.querySelector("#fridge-handle");
const fridgeInterior = document.querySelector("#fridge-interior");
const guard = document.querySelector("#guard");
const foodItems = [...document.querySelectorAll(".food-item")];
const cookie = document.querySelector('[data-food="cookie"]');
const openingCount = document.querySelector("#opening-count");
const statusMessage = document.querySelector("#status-message");
const attemptHint = document.querySelector("#attempt-hint");
const soundToggle = document.querySelector("#sound-toggle");
const resetButton = document.querySelector("#reset-button");

const defaultFoodPositions = foodItems.map((item) => ({
  x: item.style.getPropertyValue("--x"),
  y: item.style.getPropertyValue("--y"),
}));

const timerIds = new Set();
let openings = readNumber(STORAGE_KEYS.openings);
let isOpen = false;
let isDragging = false;
let dragStartX = 0;
let dragStartProgress = 0;
let dragProgress = 0;
let dragMoved = false;
let suppressNextClick = false;
let lastReaction = "";

function readNumber(key) {
  try {
    const value = Number.parseInt(localStorage.getItem(key) ?? "0", 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

function readSoundPreference() {
  try {
    return localStorage.getItem(STORAGE_KEYS.sound) !== "off";
  } catch {
    return true;
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // The game still works when storage is unavailable (for example, private mode).
  }
}

function schedule(callback, delay) {
  const timerId = window.setTimeout(() => {
    timerIds.delete(timerId);
    callback();
  }, delay);
  timerIds.add(timerId);
  return timerId;
}

function clearScheduledActions() {
  timerIds.forEach((timerId) => window.clearTimeout(timerId));
  timerIds.clear();
}

class SoundBoard {
  constructor(enabled) {
    this.enabled = enabled;
    this.context = null;
  }

  getContext() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.context = new AudioContextClass();
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }
    return this.context;
  }

  tone({ frequency = 440, endFrequency = frequency, duration = 0.12, type = "sine", volume = 0.05, delay = 0 }) {
    if (!this.enabled) return;
    const context = this.getContext();
    if (!context) return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.025, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  door(opening) {
    this.tone({
      frequency: opening ? 94 : 125,
      endFrequency: opening ? 54 : 76,
      duration: opening ? 0.62 : 0.34,
      type: "sawtooth",
      volume: 0.035,
    });
    this.tone({
      frequency: opening ? 178 : 86,
      endFrequency: opening ? 116 : 58,
      duration: 0.24,
      type: "triangle",
      volume: 0.045,
      delay: opening ? 0.08 : 0.25,
    });
  }

  character(mood = "alert") {
    const sounds = {
      alert: [520, 740, 0.09],
      panic: [780, 320, 0.2],
      sneaky: [280, 430, 0.16],
      proud: [392, 784, 0.32],
    };
    const [frequency, endFrequency, duration] = sounds[mood] ?? sounds.alert;
    this.tone({ frequency, endFrequency, duration, type: "square", volume: 0.035 });
    if (mood === "proud") {
      this.tone({ frequency: 523, endFrequency: 1046, duration: 0.3, type: "triangle", volume: 0.04, delay: 0.16 });
    }
  }

  click() {
    this.tone({ frequency: 360, endFrequency: 520, duration: 0.07, type: "sine", volume: 0.025 });
  }
}

const soundBoard = new SoundBoard(readSoundPreference());

function chooseFood(exclusions = []) {
  const candidates = foodItems.filter((item) => !exclusions.includes(item.dataset.food));
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function shuffle(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

const reactions = [
  {
    id: "hide-food",
    message: "Crumb deploys emergency snack camouflage.",
    sound: "sneaky",
    run() {
      const target = chooseFood();
      target.classList.add("is-hidden");
      guard.classList.add("is-hiding");
      guard.style.setProperty("--guard-x", target.style.getPropertyValue("--x"));
      guard.style.setProperty("--guard-y", target.style.getPropertyValue("--y"));
    },
  },
  {
    id: "shelf-shuffle",
    message: "Shelf reassignment! Everyone act refrigerated.",
    sound: "alert",
    run() {
      let shuffled = shuffle(defaultFoodPositions);
      if (shuffled.every((position, index) => position === defaultFoodPositions[index])) {
        shuffled = [...shuffled.slice(1), shuffled[0]];
      }
      foodItems.forEach((item, index) => {
        item.style.setProperty("--x", shuffled[index].x);
        item.style.setProperty("--y", shuffled[index].y);
      });
    },
  },
  {
    id: "snack-run",
    message: "A snack breaks formation and makes a run for it!",
    sound: "panic",
    run() {
      chooseFood(["cookie"]).classList.add("is-running");
    },
  },
  {
    id: "lights-out",
    message: "Lights out. Two tiny eyes remain on duty.",
    sound: "sneaky",
    run() {
      fridgeInterior.classList.add("light-off");
    },
  },
  {
    id: "inside-hand",
    message: "An inside hand votes to end this inspection.",
    sound: "panic",
    run() {
      fridgeInterior.classList.add("show-hand");
      schedule(() => {
        if (isOpen) setDoor(false, { announce: false });
      }, 1700);
    },
  },
  {
    id: "nothing-sign",
    message: "Official notice: NOTHING TO SEE HERE.",
    sound: "alert",
    run() {
      fridgeInterior.classList.add("show-sign");
    },
  },
  {
    id: "food-disguise",
    message: "Crumb? No. That is clearly a completely normal tomato.",
    sound: "sneaky",
    run() {
      guard.style.setProperty("--guard-x", "125px");
      guard.style.setProperty("--guard-y", "210px");
      guard.classList.add("is-pretending");
    },
  },
  {
    id: "broccoli",
    message: "Protocol B: everything is broccoli now.",
    sound: "alert",
    run() {
      fridgeInterior.classList.add("all-broccoli");
    },
  },
  {
    id: "cookie-escape",
    message: "The note was right. The cookie knows a side exit.",
    sound: "panic",
    run() {
      cookie.classList.add("is-escaping");
    },
  },
  {
    id: "freeze",
    message: "Crumb freezes. If Crumb does not move, Crumb is a condiment.",
    sound: "sneaky",
    run() {
      guard.classList.add("is-frozen");
    },
  },
];

function resetReaction() {
  clearScheduledActions();
  fridgeInterior.classList.remove(
    "light-off",
    "show-hand",
    "show-sign",
    "all-broccoli",
    "rare-reaction",
  );
  guard.classList.remove("is-hiding", "is-pretending", "is-frozen");
  guard.style.setProperty("--guard-x", "139px");
  guard.style.setProperty("--guard-y", "368px");

  foodItems.forEach((item, index) => {
    item.classList.remove("is-hidden", "is-running", "is-escaping");
    item.style.setProperty("--x", defaultFoodPositions[index].x);
    item.style.setProperty("--y", defaultFoodPositions[index].y);
  });
}

function runRareReaction() {
  lastReaction = "rare-patrol";
  fridgeInterior.classList.add("rare-reaction");
  statusMessage.textContent = "SECRET PATROL! Ten inspections survived. The whole shelf salutes.";
  soundBoard.character("proud");
}

function runRandomReaction() {
  resetReaction();

  if (openings === 10 || (openings > 10 && Math.random() < 0.08)) {
    runRareReaction();
    return;
  }

  const availableReactions = reactions.filter((reaction) => reaction.id !== lastReaction);
  const reaction = availableReactions[Math.floor(Math.random() * availableReactions.length)];
  lastReaction = reaction.id;
  reaction.run();
  statusMessage.textContent = reaction.message;
  soundBoard.character(reaction.sound);
}

function updateCounter() {
  openingCount.textContent = String(openings).padStart(2, "0");
  const inspectionWord = openings === 1 ? "inspection" : "inspections";
  const count = document.createElement("strong");
  const milestone = openings < 10
    ? ` Secret patrol in ${10 - openings}.`
    : " Secret patrol unlocked.";

  count.textContent = String(openings);
  attemptHint.replaceChildren(
    document.createTextNode("Crumb has survived "),
    count,
    document.createTextNode(` ${inspectionWord}.${milestone}`),
  );
}

function setDoor(nextOpen, options = {}) {
  const { announce = true } = options;
  if (nextOpen === isOpen) return;

  isOpen = nextOpen;
  dragProgress = isOpen ? 1 : 0;
  fridgeDoor.style.removeProperty("--door-angle");
  fridgeZone.classList.toggle("is-open", isOpen);
  fridgeHandle.setAttribute("aria-expanded", String(isOpen));
  fridgeHandle.setAttribute("aria-label", isOpen ? "Close refrigerator" : "Open refrigerator");
  soundBoard.door(isOpen);

  if (isOpen) {
    openings += 1;
    persist(STORAGE_KEYS.openings, openings);
    updateCounter();
    runRandomReaction();
  } else {
    if (announce) {
      statusMessage.textContent = "Door sealed. The night shift resumes.";
    }
    schedule(resetReaction, 720);
  }
}

function finishDrag() {
  if (!isDragging) return;
  isDragging = false;
  fridgeZone.classList.remove("is-dragging");

  if (dragMoved) {
    suppressNextClick = true;
    setDoor(dragProgress >= 0.42);
    if ((dragProgress >= 0.42) === isOpen) {
      fridgeDoor.style.removeProperty("--door-angle");
    }
  } else {
    fridgeDoor.style.removeProperty("--door-angle");
  }
}

fridgeHandle.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  isDragging = true;
  dragMoved = false;
  dragStartX = event.clientX;
  dragStartProgress = isOpen ? 1 : 0;
  dragProgress = dragStartProgress;
  fridgeZone.classList.add("is-dragging");
  fridgeHandle.setPointerCapture(event.pointerId);
});

fridgeHandle.addEventListener("pointermove", (event) => {
  if (!isDragging) return;
  const distance = dragStartX - event.clientX;
  const threshold = Math.max(120, fridgeZone.getBoundingClientRect().width * 0.72);
  dragProgress = Math.min(1, Math.max(0, dragStartProgress + distance / threshold));
  dragMoved ||= Math.abs(distance) > 5;
  fridgeDoor.style.setProperty("--door-angle", `${-82 * dragProgress}deg`);
});

fridgeHandle.addEventListener("pointerup", finishDrag);
fridgeHandle.addEventListener("pointercancel", finishDrag);

fridgeHandle.addEventListener("click", () => {
  if (suppressNextClick) {
    suppressNextClick = false;
    return;
  }
  setDoor(!isOpen);
});

soundToggle.addEventListener("click", () => {
  soundBoard.enabled = !soundBoard.enabled;
  persist(STORAGE_KEYS.sound, soundBoard.enabled ? "on" : "off");
  updateSoundControl();
  if (soundBoard.enabled) soundBoard.click();
});

resetButton.addEventListener("click", () => {
  clearScheduledActions();
  isOpen = false;
  dragProgress = 0;
  openings = 0;
  lastReaction = "";
  persist(STORAGE_KEYS.openings, openings);
  fridgeZone.classList.remove("is-open", "is-dragging");
  fridgeDoor.style.removeProperty("--door-angle");
  fridgeHandle.setAttribute("aria-expanded", "false");
  fridgeHandle.setAttribute("aria-label", "Open refrigerator");
  resetReaction();
  updateCounter();
  statusMessage.textContent = "Case reset. The kitchen has forgotten everything.";
  soundBoard.click();
  fridgeHandle.focus();
});

function updateSoundControl() {
  soundToggle.setAttribute("aria-pressed", String(soundBoard.enabled));
  soundToggle.querySelector("span").textContent = soundBoard.enabled ? "Sound on" : "Sound off";
  soundToggle.setAttribute("aria-label", soundBoard.enabled ? "Turn sound off" : "Turn sound on");
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden && soundBoard.context?.state === "running") {
    soundBoard.context.suspend();
  }
});

updateCounter();
updateSoundControl();
