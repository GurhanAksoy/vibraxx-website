// 🔊 VibraXX Global AudioController (Singleton)

let globalAudio: HTMLAudioElement | null =
  typeof window !== "undefined"
    ? ((window as any).__vibraxx_audio as HTMLAudioElement | null) || null
    : null;

let isPlaying = false;

/**
 * Starts looping menu music (safe singleton)
 */
export async function playMenuMusic() {
  if (typeof window === "undefined") return;

  try {
    if (!globalAudio) {
      globalAudio = new Audio("/sounds/vibraxx.mp3");
      globalAudio.loop = true;
      globalAudio.preload = "auto";
      globalAudio.volume = 0.5;

      (window as any).__vibraxx_audio = globalAudio;
    }

    if (!isPlaying) {
      await globalAudio.play().catch(() => {
        // Autoplay blocked – must be triggered by user interaction
        console.warn("🔇 Autoplay blocked – waiting for user interaction");
      });
      isPlaying = true;
    }
  } catch (err) {
    console.error("🎵 playMenuMusic error:", err);
  }
}

/**
 * Stops menu music and resets
 */
export function stopMenuMusic() {
  if (!globalAudio) return;

  try {
    globalAudio.pause();
    globalAudio.currentTime = 0;
    isPlaying = false;
  } catch (err) {
    console.error("🎵 stopMenuMusic error:", err);
  }
}
