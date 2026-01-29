// src/lib/audioManager.ts

let audio: HTMLAudioElement | null = null;
let initialized = false;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/sounds/vibraxx.mp3");
    audio.loop = true;
    audio.preload = "auto";
  }
  return audio;
}

export function initMenuMusicOnFirstGesture() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  const handler = () => {
    const a = getAudio();
    a.play().catch(() => {});
    document.removeEventListener("click", handler);
  };

  document.addEventListener("click", handler, { once: true });
}

export async function playMenuMusic() {
  if (typeof window === "undefined") return;

  const a = getAudio();
  if (!a.paused) return;

  try {
    await a.play();
  } catch {
    // autoplay blocked → wait for user gesture
    initMenuMusicOnFirstGesture();
  }
}

export function stopMenuMusic() {
  if (!audio) return;
  audio.pause();
}
