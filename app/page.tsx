"use client";

import { useState } from "react";
import PlayerInput from "./components/PlayerInput";
import GameScreen from "./components/GameScreen";
import GameOver from "./components/GameOver";

type GameState = "input" | "playing" | "over";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("input");
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  const startGame = (playerNames: string[]) => {
    setPlayers(playerNames);
    setScores(new Array(playerNames.length).fill(0));
    setGameState("playing");
  };

  const endGame = () => {
    setGameState("over");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {gameState === "input" && <PlayerInput onStart={startGame} />}
        {gameState === "playing" && (
          <GameScreen players={players} scores={scores} setScores={setScores} onGameEnd={endGame} />
        )}
        {gameState === "over" && <GameOver players={players} scores={scores} />}
      </div>
    </div>
  );
}

