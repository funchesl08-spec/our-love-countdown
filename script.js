const LOVE_START = new Date(2026, 3, 1, 0, 0, 0);

const pad = (number) => String(number).padStart(2, "0");

function getNextAnniversary(now) {
  let year = now.getFullYear();
  let date = new Date(year, 3, 1, 0, 0, 0);
  if (date <= now) date = new Date(year + 1, 3, 1, 0, 0, 0);
  return date;
}

function updateTimers() {
  const now = new Date();
  const together = Math.max(0, now - LOVE_START);
  const togetherDays = Math.floor(together / 86400000);
  const togetherHours = Math.floor((together / 3600000) % 24);
  const togetherMinutes = Math.floor((together / 60000) % 60);
  const togetherSeconds = Math.floor((together / 1000) % 60);

  document.querySelector("#togetherDays").textContent = togetherDays;
  document.querySelector("#togetherHours").textContent = pad(togetherHours);
  document.querySelector("#togetherMinutes").textContent = pad(togetherMinutes);
  document.querySelector("#togetherSeconds").textContent = pad(togetherSeconds);

  const next = getNextAnniversary(now);
  const remaining = Math.max(0, next - now);
  document.querySelector("#nextYear").textContent = next.getFullYear();
  document.querySelector("#nextDays").textContent = Math.floor(remaining / 86400000);
  document.querySelector("#nextHours").textContent = pad(Math.floor((remaining / 3600000) % 24));
  document.querySelector("#nextMinutes").textContent = pad(Math.floor((remaining / 60000) % 60));
  document.querySelector("#nextSeconds").textContent = pad(Math.floor((remaining / 1000) % 60));

  const previous = new Date(next.getFullYear() - 1, 3, 1, 0, 0, 0);
  const progress = Math.min(100, Math.max(0, ((now - previous) / (next - previous)) * 100));
  document.querySelector("#progressFill").style.width = `${progress}%`;
  document.querySelector("#progressText").textContent = `${progress.toFixed(1)}%`;
}

updateTimers();
setInterval(updateTimers, 1000);

// Scroll reveal
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
  revealObserver.observe(element);
});

document.querySelector("#scrollHint").addEventListener("click", () => {
  document.querySelector("#story").scrollIntoView({ behavior: "smooth" });
});

// Star particles
const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
let stars = [];
let width = 0;
let height = 0;
let mouse = { x: -1000, y: -1000 };

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(150, Math.floor((width * height) / 9000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.4 + 0.2,
    speed: Math.random() * 0.12 + 0.025,
    alpha: Math.random() * 0.65 + 0.18,
    phase: Math.random() * Math.PI * 2
  }));
}

function drawStars(time) {
  ctx.clearRect(0, 0, width, height);
  stars.forEach((star) => {
    star.y -= star.speed;
    if (star.y < -5) {
      star.y = height + 5;
      star.x = Math.random() * width;
    }

    const dx = mouse.x - star.x;
    const dy = mouse.y - star.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 110) {
      star.x -= dx * 0.0018;
      star.y -= dy * 0.0018;
    }

    const shimmer = Math.sin(time * 0.0012 + star.phase) * 0.2;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 235, 251, ${star.alpha + shimmer})`;
    ctx.fill();
  });
  requestAnimationFrame(drawStars);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});
resizeCanvas();
requestAnimationFrame(drawStars);

// Click anywhere to scatter little hearts
document.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) return;
  for (let i = 0; i < 7; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart-burst";
    heart.textContent = Math.random() > 0.28 ? "♥" : "✦";
    heart.style.left = `${event.clientX}px`;
    heart.style.top = `${event.clientY}px`;
    heart.style.setProperty("--dx", `${(Math.random() - 0.5) * 150}px`);
    heart.style.setProperty("--dy", `${-35 - Math.random() * 120}px`);
    heart.style.setProperty("--rot", `${(Math.random() - 0.5) * 150}deg`);
    heart.style.animationDelay = `${Math.random() * 90}ms`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1400);
  }
});

// Tiny generative ambient sound — no audio file needed.
let audioContext;
let soundTimer;
const soundButton = document.querySelector("#soundButton");

function playTone(frequency, delay = 0) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
  gain.gain.linearRampToValueAtTime(0.025, audioContext.currentTime + delay + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + delay + 1.8);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(audioContext.currentTime + delay);
  oscillator.stop(audioContext.currentTime + delay + 2);
}

function playAmbientPhrase() {
  [261.63, 329.63, 392, 493.88].forEach((note, index) => playTone(note, index * 0.42));
}

soundButton.addEventListener("click", () => {
  if (soundTimer) {
    clearInterval(soundTimer);
    soundTimer = null;
    soundButton.classList.remove("playing");
    soundButton.querySelector(".sound-label").textContent = "开启声音";
    soundButton.setAttribute("aria-label", "开启声音");
    return;
  }
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  playAmbientPhrase();
  soundTimer = setInterval(playAmbientPhrase, 7000);
  soundButton.classList.add("playing");
  soundButton.querySelector(".sound-label").textContent = "关闭声音";
  soundButton.setAttribute("aria-label", "关闭声音");
});

const wishes = [
  "愿我们的故事，永远有下一页。",
  "愿所有的好天气，都恰好有你在身边。",
  "愿我们慢慢相爱，也慢慢变成更好的自己。",
  "愿很多年以后，我们还会为今天心动。",
  "愿小小的我们，拥有长长久久的幸福。"
];

document.querySelector("#wishButton").addEventListener("click", (event) => {
  const message = wishes[Math.floor(Math.random() * wishes.length)];
  document.querySelector("#wishMessage").textContent = message;
  const toast = document.querySelector("#toast");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);

  for (let i = 0; i < 18; i += 1) {
    const spark = document.createElement("span");
    spark.className = "heart-burst";
    spark.textContent = i % 3 === 0 ? "♥" : "✦";
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.setProperty("--dx", `${(Math.random() - 0.5) * 280}px`);
    spark.style.setProperty("--dy", `${-40 - Math.random() * 210}px`);
    spark.style.setProperty("--rot", `${Math.random() * 240}deg`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1400);
  }
});
