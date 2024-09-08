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
    <div>
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Game Logo" width={200} height={100} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Enter Player Names (3-6 players)</h2>
      <p className="text-sm text-gray-600 mb-4">
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
            className="block w-full p-2 border rounded"
            placeholder={`Player ${index + 1}`}
          />
        </div>
      ))}
      {players.length < 6 && (
        <button
          onClick={addPlayer}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
        >
          Add Player
        </button>
      )}
      <button
        onClick={startGame}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Start Game
      </button>
    </div>
  );
}
