import { useGameManager } from "../utils/GameManager";
import Image from 'next/image';

interface GameOverProps {
  players: string[];
  onStartOver: () => void;
}

export default function GameOver({ players, onStartOver }: GameOverProps) {
  const { gameState, resetGame } = useGameManager(players);

  const sortedResults = gameState.players
    .map((player, index) => ({ name: player, score: gameState.scores[index] }))
    .sort((a, b) => b.score - a.score);

  const handleStartOver = () => {
    if (window.confirm("Are you sure you want to start over? All game data will be cleared.")) {
      resetGame();
      onStartOver();
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <Image src="/logo.png" alt="Game Logo" width={200} height={100} />
      </div>
      <h2 className="text-2xl font-bold mb-4">Game Over</h2>
      <h2 className="text-xl font-bold mb-2">Final Scores:</h2>
      {sortedResults.map((result, index) => (
        <div key={index} className="mb-2">
          <span className="font-bold">{index + 1}. {result.name}: {result.score}</span>
        </div>
      ))}
      
      <button
        onClick={handleStartOver}
        className="mt-4 px-4 py-2 rounded bg-blue-500 text-white"
      >
        Start Over
      </button>
    </div>
  );
}
