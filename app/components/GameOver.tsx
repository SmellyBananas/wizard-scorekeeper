import { useGameManager } from "../utils/GameManager";
import Image from 'next/image';

interface GameOverProps {
  players: string[];
  onStartOver: () => void;
  onPlayAgain: () => void; // Add this new prop
}

export default function GameOver({ players, onStartOver, onPlayAgain }: GameOverProps) {
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

  const handlePlayAgain = () => {
    resetGame();
    onPlayAgain();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center relative overflow-hidden">
        <div className="top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-200 to-gray-400">
          <div className="h-full flex items-center justify-center">
            <Image src="/logo.png" alt="Game Logo" width={200} height={100} className="mx-auto" />
          </div>
        </div>
        <h2 className="text-5xl font-bold mb-6 text-yellow-400 animate-pulse mt-10">Game Over</h2>
        <h3 className="text-2xl font-bold mb-4 text-green-400">Final Scores:</h3>
        <div className="space-y-2 mb-6">
          {sortedResults.map((result, index) => (
            <div key={index} className={`text-xl ${index === 0 ? 'text-yellow-400 font-bold' : ''}`}>
              <span>{index + 1}. {result.name}: {result.score}</span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handlePlayAgain}
            className="px-6 py-3 rounded-full bg-green-600 text-white font-bold hover:bg-green-700 transition duration-300 transform hover:scale-105"
          >
            Play Again
          </button>
          <button
            onClick={handleStartOver}
            className="px-6 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
