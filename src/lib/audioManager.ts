// 📁 src/lib/audioManager.ts

let audio: HTMLAudioElement | null =
  typeof window !== "undefined" ? (window as any).__vibraxx_audio || null : null;

let isInitializing = false;

/**
 * Play persistent background menu music
 * - Only one global audio instance exists
 * - Handles autoplay restrictions
 * - Works on Safari, iOS, Android
 */
export async function playMenuMusic() {
  if (typeof window === "undefined") return;

  try {
    // Avoid duplicate init race condition
    if (isInitializing) return;
    isInitializing = true;

    if (!audio) {
      audio = new Audio("/sounds/vibraxx.mp3");
      audio.loop = true;
      audio.preload = "auto";

      // iOS requires setting these
      audio.autoplay = false;
      audio.crossOrigin = "anonymous";

      // Save globally
      (window as any).__vibraxx_audio = audio;

      try {
        await audio.play();
      } catch (err) {
        console.warn("Autoplay blocked, waiting for user gesture…", err);
      }
    } else {
      // Already created
      if (audio.paused) {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay blocked:", err);
        }
      }
    }
  } catch (err) {
    console.error("🎵 playMenuMusic ERROR:", err);
  } finally {
    isInitializing = false;
  }
}

/**
 * Fully stop music and reset
 */
export function stopMenuMusic() {
  if (typeof window === "undefined") return;

  const globalAudio = (window as any).__vibraxx_audio;

  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }
}

/**
 * Pause without resetting (for pages where music should pause)
 */
export function pauseMenuMusic() {
  if (typeof window === "undefined") return;

  const globalAudio = (window as any).__vibraxx_audio;
  if (globalAudio) {
    globalAudio.pause();
  }
}
