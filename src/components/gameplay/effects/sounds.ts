"use client";

const soundCache: Record<string, HTMLAudioElement> = {};

export const playSfx = (name: string, volume = 0.6) => {
  try {
    if (!soundCache[name]) {
      soundCache[name] = new Audio(`/sounds/${name}.mp3`);
    }
    const sound = soundCache[name].cloneNode(true) as HTMLAudioElement;
    sound.volume = volume;
    sound.play().catch(() => {});
  } catch {
    // sessiz geç
  }
};

export const SFX = {
  correct: "correct",
  wrong: "wrong",
  click: "click",
  start: "start",
  tick: "tick",
  gameover: "gameover",
};
