"use client";
import React from "react";
import { Volume2, VolumeX } from "lucide-react";

interface Props {
  muted: boolean;
  toggle: () => void;
}

export default function AudioController({ muted, toggle }: Props) {
  return (
    <button
      onClick={toggle}
      className="absolute top-6 right-6 p-2 bg-slate-900/60 rounded-full border border-slate-700 hover:border-purple-400 transition"
    >
      {muted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-purple-400" />}
    </button>
  );
}
