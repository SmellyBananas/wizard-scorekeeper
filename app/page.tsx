"use client";

import { useState, useEffect } from "react";
import PlayerInput from "./components/PlayerInput";
import GameScreen from "./components/GameScreen";
import GameOver from "./components/GameOver";

type GameState = "input" | "playing" | "over";

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("input");
  const [players, setPlayers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('wizardPlayers');
    const savedState = localStorage.getItem('wizardGameState');
    if (savedPlayers && savedState) {
      const parsedPlayers = JSON.parse(savedPlayers);
      const { scores } = JSON.parse(savedState);
      setPlayers(parsedPlayers);
      setScores(scores);
      setGameState('playing');
    }
  }, []);

  const handleStart = (playerNames: string[]) => {
    setPlayers(playerNames);
    setScores(new Array(playerNames.length).fill(0));
    setGameState("playing");
  };

  const handleGameEnd = () => {
    setGameState("over");
  };

  const handleStartOver = () => {
    setPlayers([]);
    setScores([]);
    setGameState("input");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        {gameState === "input" && <PlayerInput onStart={handleStart} />}
        {gameState === "playing" && (
          <GameScreen
            players={players}
            scores={scores}
            setScores={setScores}
            onGameEnd={handleGameEnd}
          />
        )}
        {gameState === "over" && (
          <GameOver
            players={players}
            scores={scores}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}

