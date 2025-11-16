export type GamePhase = "READY" | "QUESTION" | "INTERMISSION" | "RESULT";

export interface Question {
  q: string;
  options: string[];
  correct: number;
}
