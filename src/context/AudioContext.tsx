// ğŸ”¹ Global AudioController Singleton
let globalAudio: HTMLAudioElement | null =
  typeof window !== "undefined" ? (window as any).__vibraxx_audio || null : null;

export async function playMenuMusic() {
  try {
    if (!globalAudio) {
      globalAudio = new Audio("/sounds/vibraxx.mp3");
      globalAudio.loop = true;
      globalAudio.preload = "auto";
      (window as any).__vibraxx_audio = globalAudio; // ğŸ§  global referans
    }

    if (globalAudio.paused) {
      await globalAudio.play();
    }
  } catch (err) {
    console.error("ğŸµ playMenuMusic error:", err);
  }
}

export function stopMenuMusic() {
  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }
}


