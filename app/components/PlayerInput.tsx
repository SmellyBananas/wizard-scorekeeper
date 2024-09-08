import { useState, useEffect, KeyboardEvent } from "react";
import Image from 'next/image';

interface PlayerInputProps {
  onStart: (players: string[]) => void;
}

export default function PlayerInput({ onStart }: PlayerInputProps) {
  const [players, setPlayers] = useState<string[]>(["", "", ""]);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('wizardPlayers');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, ""]);
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const startGame = () => {
    const validPlayers = players.filter((name) => name.trim() !== "");
    if (validPlayers.length >= 3 && validPlayers.length <= 6) {
      localStorage.setItem('wizardPlayers', JSON.stringify(validPlayers));
      onStart(validPlayers);
    } else {
      alert("Please enter 3 to 6 player names.");
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (index === players.length - 1) {
        addPlayer();
      } else {
        const nextInput = document.querySelector(`input[name="player-${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center relative overflow-hidden">
        <div className="top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-200 to-gray-400">
          <div className="h-full flex items-center justify-center">
            <Image src="/logo.png" alt="Game Logo" width={200} height={100} className="mx-auto" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-yellow-400 mt-10">Enter Player Names</h2>
        <p className="text-sm text-gray-400 mb-4">
          The order you enter players will be the dealing order. The first player entered will deal first.
        </p>
        {players.map((player, index) => (
          <div key={index} className="mb-2">
            <input
              type="text"
              name={`player-${index}`}
              value={player}
              onChange={(e) => updatePlayer(index, e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              className="block w-full p-2 border rounded bg-gray-700 text-white"
              placeholder={`Player ${index + 1}`}
            />
          </div>
        ))}
        <div className="flex justify-center space-x-4 mt-8">
          {players.length < 6 && (
            <button
              onClick={addPlayer}
              className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
              Add Player
            </button>
          )}
          <button
            onClick={startGame}
            className="px-6 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300 transform hover:scale-105"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
