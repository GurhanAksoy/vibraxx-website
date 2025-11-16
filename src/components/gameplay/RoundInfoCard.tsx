"use client";
import React from "react";
import { Users, Radio } from "lucide-react";

interface Props {
  round: number;
  players: number;
}

export default function RoundInfoCard({ round, players }: Props) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-500/50 rounded-full animate-pulse">
          <Radio className="w-4 h-4 text-red-400" />
          <span className="text-sm font-semibold">LIVE</span>
        </div>
        <span className="text-gray-400">Round #{round}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        <Users className="w-4 h-4" />
        <span>{players.toLocaleString()} players</span>
      </div>
    </div>
  );
}
