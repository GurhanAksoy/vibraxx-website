// 📁 C:\Users\Gürhan Aksoy\Documents\GitHub\vibraxx-website\src\lib\audioManager.ts

let audio: HTMLAudioElement | null =
  typeof window !== "undefined" ? (window as any).__vibraxx_audio || null : null;

export async function playMenuMusic() {
  try {
    if (!audio) {
      audio = new Audio();
      audio.src = "/sounds/vibraxx.mp3";
      audio.loop = true;
      audio.preload = "auto";
      await audio.load();
      (window as any).__vibraxx_audio = audio; // 🧠 Global referans
    }

    if (audio && !audio.paused) return;

    await audio.play().catch(err => {
      console.warn("Autoplay blocked by browser:", err);
    });
  } catch (err) {
    console.error("🎵 playMenuMusic error:", err);
  }
}

export function stopMenuMusic() {
  const globalAudio =
    typeof window !== "undefined" ? (window as any).__vibraxx_audio : audio;

  if (globalAudio) {
    globalAudio.pause();
    globalAudio.currentTime = 0;
  }
}
