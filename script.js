// 📄 Gestione pagine
const pages = {
  home: document.getElementById("page-home"),
  date: document.getElementById("page-date"),
  generate: document.getElementById("page-generate"),
};

const startBtn = document.getElementById("start-btn");
const generateBtn = document.getElementById("generate-btn");
const resetBtn = document.getElementById("reset-btn");
const backBtn = document.getElementById("back-btn");
const downloadBtn = document.getElementById("download-btn");
const birthInput = document.getElementById("birthdate");
const selectedDateText = document.getElementById("selected-date");
const canvasContainer = document.getElementById("canvasContainer");
const generatingText = document.querySelector(".generating-text");

const backArrow = document.getElementById("back-arrow");

function updateBackArrow(page) {
  if (page === "date" || page === "generate") {
    backArrow.classList.add("visible");
  } else {
    backArrow.classList.remove("visible");
  }
}

// 👈 Azione della freccia indietro
backArrow.addEventListener("click", () => {
  if (pages.generate.classList.contains("active")) {
    showPage("date");
  } else if (pages.date.classList.contains("active")) {
    showPage("home");
  }
});

const logo = document.getElementById("logo");

logo.addEventListener("click", () => {
  if (pages.generate.classList.contains("active")) {
    showPage("date");
  } else if (pages.date.classList.contains("active")) {
    showPage("home");
  }
});


// 🌍 Lingua
const langButtons = document.querySelectorAll(".lang-btn");
let currentLang = "it";
let generationState = "idle"; // "idle" | "generating" | "finished"
let currentGenerationPhrase = null;
let currentFinalPhrase = null;


// 🧭 Gestione cronologia browser
window.addEventListener("popstate", (event) => {
  const page = event.state?.page || "home";
  showPage(page, false);
});

function pushState(page) {
  history.pushState({ page }, "", `#${page}`);
}

// 🌍 Cambio lingua
langButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentLang = btn.dataset.lang;
    updateLanguage();
    updateLangButtons();
  });
});

function updateLangButtons() {
  langButtons.forEach(b => b.classList.remove("active"));
  const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
  if (activeBtn) activeBtn.classList.add("active");
}

function updateLanguage() {
  document.querySelectorAll("[data-lang-it]").forEach(el => {
    if (el.classList.contains("generating-text")) {
      if (generationState === "generating") {
        currentGenerationPhrase = getRandomGenerationPhrase(currentLang);
        el.innerHTML = currentGenerationPhrase;
      } else if (generationState === "finished") {
        currentFinalPhrase = getRandomFinalPhrase(currentLang);
        el.innerHTML = currentFinalPhrase;
      } else {
        el.innerHTML = el.getAttribute(`data-lang-${currentLang}`);
      }
    } else {
      el.innerHTML = el.getAttribute(`data-lang-${currentLang}`);
    }
  });

  // 👇 cambia placeholder in base alla lingua
  const birthInput = document.getElementById("birthdate");
  birthInput.placeholder = currentLang === "it" ? "gg/mm/aaaa" : "dd/mm/yyyy";
}

// 🧭 Navigazione
function showPage(page, push = true) {
  Object.values(pages).forEach(p => p.classList.remove("active"));
  pages[page].classList.add("active");
  updateBackArrow(page); // 👈 aggiunto qui
  if (push) pushState(page);
}


// 📅 Overlay calendario
const openCalendarBtn = document.getElementById("open-calendar");
const closeCalendarBtn = document.getElementById("close-calendar");
const calendarOverlay = document.getElementById("calendar-overlay");

openCalendarBtn.addEventListener("click", (e) => {
  e.preventDefault();
  calendarOverlay.classList.add("active");
  document.body.classList.add("overlay-active");
});

closeCalendarBtn.addEventListener("click", () => {
  calendarOverlay.classList.remove("active");
  document.body.classList.remove("overlay-active");
});

// Chiudi overlay cliccando fuori
calendarOverlay.addEventListener("click", (e) => {
  if (e.target === calendarOverlay) {
    calendarOverlay.classList.remove("active");
    document.body.classList.remove("overlay-active");
  }
});


// 🌱 Eventi pagine
startBtn?.addEventListener("click", () => showPage("date"));

generateBtn?.addEventListener("click", () => {
  const inputValue = birthInput.value;

  // ⚠️ Validazione data
  if (!isValidDate(inputValue)) {
    alert("Inserisci una data valida nel formato gg/mm/aaaa");
    return;
  }

  const [day, month, year] = inputValue.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  selectedDateText.innerHTML = formattedDate;
  showPage("generate");

  // ✨ Stato: generazione in corso
  generationState = "generating";
  currentGenerationPhrase = getRandomGenerationPhrase(currentLang);
  generatingText.innerHTML = currentGenerationPhrase;

  downloadBtn.classList.remove("visible");
  backBtn.classList.remove("visible");

  canvasContainer.classList.add("generating");
  canvas.classList.remove("pixel-animation");
  canvas.style.opacity = 0;

  generateCircle(date);

  void canvas.offsetWidth;

  // Durata animazione random tra 2 e 6 secondi
  const minDuration = 2000;
  const maxDuration = 6000;
  const animDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration;

  canvas.style.animationDuration = `${animDuration}ms`;
  canvas.classList.add("pixel-animation");

  setTimeout(() => {
    canvas.style.opacity = 1;
    canvasContainer.classList.remove("generating");
    downloadBtn.classList.add("visible");
    backBtn.classList.add("visible");

    generationState = "finished";
    currentFinalPhrase = getRandomFinalPhrase(currentLang);
    generatingText.innerHTML = currentFinalPhrase;
  }, animDuration);
});

// ✨ Formattazione automatica gg/mm/aaaa
birthInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/\D/g, "");

  // 🇮🇹 gg/mm/aaaa oppure 🇬🇧 dd/mm/yyyy — la struttura è identica
  if (value.length >= 3 && value.length <= 4) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  } else if (value.length >= 5) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4) + "/" + value.slice(4, 8);
  }

  e.target.value = value;
});

// ✅ Funzione per controllare che la data sia valida
function isValidDate(value) {
  const parts = value.split("/");
  if (parts.length !== 3) return false;

  const [day, month, year] = parts.map(Number);

  // Controllo formale
  if (!day || !month || !year || year < 1000 || year > 9999) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// ✨ Frasi di generazione
const generationPhrases = {
  it: [
    "Attendi un attimo, stiamo intrecciando i fili del tempo…",
    "Il tuo anello sta prendendo forma, frammento dopo frammento…",
    "Stiamo trasformando la tua data in un segno unico…",
    "Il tempo diventa immagine, attendi ancora un momento…"
  ],
  en: [
    "Hold on, we’re weaving the threads of time…",
    "Your ring is taking shape, fragment by fragment…",
    "We’re transforming your date into a unique sign…",
    "Time is becoming image, just a moment more…"
  ]
};

function getRandomGenerationPhrase(lang) {
  const phrases = generationPhrases[lang] || generationPhrases.it;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ✨ Frasi finali
const finalPhrases = {
  it: [
    "Il tuo anello è pronto. Un frammento di tempo, solo tuo.",
    "Ecco il segno del tuo giorno: scaricalo e custodiscilo.",
    "La tua data ha trovato forma. Scarica il tuo anello.",
    "Un momento è diventato immagine. Ora è tuo."
  ],
  en: [
    "Your ring is ready. A fragment of time, uniquely yours.",
    "Here is the sign of your day: download it and keep it close.",
    "Your date has taken shape. Download your ring.",
    "A moment has become an image. It’s yours now."
  ]
};

function getRandomFinalPhrase(lang) {
  const phrases = finalPhrases[lang] || finalPhrases.it;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// 🧹 Pulsanti vari
resetBtn?.addEventListener("click", () => {
  birthInput.value = "";
});

backBtn?.addEventListener("click", () => {
  generationState = "idle";
  currentGenerationPhrase = null;
  currentFinalPhrase = null;
  showPage("date");
});

downloadBtn?.addEventListener("click", () => {
  canvas.toBlob((blob) => {
    const file = new File([blob], "anello_personale.png", { type: "image/png" });

    // 📲 Se il dispositivo supporta la Web Share API (iOS / Android moderni)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({
        files: [file],
        title: 'Anello personale',
        text: 'Ecco il tuo anello generato: un frammento di tempo, solo tuo.',
      }).catch((err) => {
        console.log('Condivisione annullata o non riuscita:', err);
      });
    } else {
      // 💾 Fallback: download classico
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "anello_personale.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }
  }, "image/png");
});

// 🖼️ Canvas + Generazione immagine
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// 🔥 Imposta risoluzione reale alta per il download
const EXPORT_SIZE = 2048;
canvas.width = EXPORT_SIZE;
canvas.height = EXPORT_SIZE;

const imagePaths = Array.from({ length: 12 }, (_, i) => `img/img${i + 1}.png`);
const blendModes = ["screen", "overlay", "soft-light"];
let images = [];
let lastPair = null; 

function stringToSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  return Math.abs(h);
}

function seededRandom(seed) {
  let v = seed % 2147483647; if (v <= 0) v += 2147483646;
  return function() { v = v * 16807 % 2147483647; return (v - 1) / 2147483646; };
}

function deterministicOpacity(rand) {
  const min = 60, max = 90;
  return (Math.floor(rand() * (max - min + 1)) + min) / 100;
}

function pickOverlayIndex(baseIndex, rand) {
  let idx;
  do {
    idx = Math.floor(rand() * images.length);
  } while (idx === baseIndex || idx === 0);
  return idx;
}

function pickBlendMode(overlayIndex, rand) {
  if (overlayIndex === 1 || overlayIndex === 6 || overlayIndex === 11) {
    return "screen";
  } else {
    return blendModes[Math.floor(rand() * blendModes.length)];
  }
}

function fuseImagesLocally(baseImg, overlayImg, baseOpacity, overlayOpacity, blendMode) {
  if (!baseImg || !overlayImg) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = baseOpacity;
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = blendMode;
  ctx.globalAlpha = overlayOpacity;
  ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

function generateCircle(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const seed = stringToSeed(`${day}-${month}-${year}`);
  const rand = seededRandom(seed);

  const TWELVE = 11;
  const BLOCKED_PAIR = 7;
  const IMG3 = 2;
  const IMG5 = 4;

  let baseIndex = month - 1;
  let overlayIndex = pickOverlayIndex(baseIndex, rand);

  // ❌ Evita coppia bloccata 12–8
  while ((baseIndex === TWELVE && overlayIndex === BLOCKED_PAIR) ||
         (baseIndex === BLOCKED_PAIR && overlayIndex === TWELVE)) {
    overlayIndex = pickOverlayIndex(baseIndex, rand);
  }

  // ❌ Evita coppia bloccata 3–5
  while ((baseIndex === IMG3 && overlayIndex === IMG5) ||
         (baseIndex === IMG5 && overlayIndex === IMG3)) {
    overlayIndex = pickOverlayIndex(baseIndex, rand);
  }

  const baseOpacity = deterministicOpacity(rand);
  const overlayOpacity = deterministicOpacity(rand);
  let blendMode = pickBlendMode(overlayIndex, rand);

  const doSwap = rand() < 0.5;
  if (doSwap && baseIndex !== 0 && overlayIndex !== 0) {
    [baseIndex, overlayIndex] = [overlayIndex, baseIndex];
    blendMode = pickBlendMode(overlayIndex, rand);
  }

  const SPECIAL = new Set([5, 9]);
  if ((baseIndex === TWELVE && SPECIAL.has(overlayIndex)) ||
      (overlayIndex === TWELVE && SPECIAL.has(baseIndex))) {
    const other = (baseIndex === TWELVE) ? overlayIndex : baseIndex;
    baseIndex = TWELVE;
    overlayIndex = other;
    blendMode = pickBlendMode(overlayIndex, rand);
  }

  lastPair = [baseIndex, overlayIndex];

  fuseImagesLocally(images[baseIndex], images[overlayIndex], baseOpacity, overlayOpacity, blendMode);
}

// 📥 Precarica immagini
function preloadImages(paths) {
  return Promise.all(paths.map(path => new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = path;
    img.onload = () => resolve(img);
  })));
}

preloadImages(imagePaths).then(loaded => {
  images = loaded;
});

// 🌍 Lingua default + inizializzazione cronologia
window.addEventListener("DOMContentLoaded", () => {
  currentLang = "it";
  updateLanguage();
  updateLangButtons();
  pushState("home");
});
