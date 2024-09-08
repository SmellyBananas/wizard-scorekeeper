import { useState, useEffect, useRef } from "react";
import { useGameManager } from "../utils/GameManager";
import Image from 'next/image';

interface GameScreenProps {
  players: string[];
  onGameEnd: () => void;
}

export default function GameScreen({ players, onGameEnd }: GameScreenProps) {
  const { gameState, updateScores, resetGame } = useGameManager(players);
  const { scores, currentRound, roundResults, totalRounds, currentDealerIndex } = gameState;
  const [bids, setBids] = useState<number[]>(new Array(players.length).fill(0));
  const [tricks, setTricks] = useState<number[]>(new Array(players.length).fill(0));
  const [isValid, setIsValid] = useState<boolean>(true);
  const [sortedPlayers, setSortedPlayers] = useState<string[]>(players);

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Remove localStorage effects as they're now handled in GameManager

  useEffect(() => {
    validateInputs();
  }, [bids, tricks]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && isValid) {
        buttonRef.current?.click();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [isValid]);

  useEffect(() => {
    const sortedIndexes = scores
      .map((score, index) => ({ score, index }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.index);
    setSortedPlayers(sortedIndexes.map(index => players[index]));
  }, [scores, players]);

  useEffect(() => {
    resetGame();
  }, [players, resetGame]);

  const validateInputs = () => {
    const bidValid = bids.every(bid => bid >= 0 && bid <= currentRound);
    const trickSum = tricks.reduce((sum, trick) => sum + trick, 0);
    const trickValid = tricks.every(trick => trick >= 0) && trickSum === currentRound;
    setIsValid(bidValid && trickValid);
  };

  const updateBid = (index: number, value: number) => {
    const newBids = [...bids];
    newBids[index] = value;
    setBids(newBids);
  };

  const updateTrick = (index: number, value: number) => {
    const newTricks = [...tricks];
    newTricks[index] = value;
    setTricks(newTricks);
  };

  const calculateScores = () => {
    if (!isValid) return;
    updateScores(bids, tricks);
    if (currentRound >= totalRounds) {
      onGameEnd();
    }
  };

  // Add this effect to reset bids and tricks when the round changes
  useEffect(() => {
    setBids(new Array(players.length).fill(0));
    setTricks(new Array(players.length).fill(0));
  }, [currentRound, players.length]);

  const inputStyle = (value: number) => 
    `border rounded p-1 w-16 ${!isValid && (value < 0 || value > currentRound) ? 'border-red-500' : ''}`;

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const NumberSelector = ({ value, onChange, max }: { value: number; onChange: (value: number) => void; max: number }) => (
    <div className="flex space-x-1">
      {Array.from({ length: max + 1 }, (_, i) => (
        <button
          key={i}
          className={`w-8 h-8 flex items-center justify-center ${
            value === i ? 'bg-purple-600 text-white' : 'bg-gray-200 text-black'
          }`}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );

  const calculateRemainingTricks = () => {
    const totalBids = bids.reduce((sum, bid) => sum + bid, 0);
    return currentRound - totalBids;
  };

  const handleQuitGame = () => {
    if (window.confirm("Are you sure you want to quit the game? This action cannot be undone.")) {
      onGameEnd();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-700 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-4xl w-full text-center relative overflow-hidden">
        <div className="top-0 left-0 right-0 h-32 bg-gradient-to-b from-gray-200 to-gray-400">
          <div className="h-full flex items-center justify-center">
            <Image src="/logo.png" alt="Game Logo" width={200} height={100} className="mx-auto" />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">Round {currentRound} of {totalRounds}</h2>
          <p className="text-lg font-semibold mb-4 text-green-400">Current Dealer: {players[currentDealerIndex]}</p>

          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-2xl font-bold mb-4 text-yellow-400">Leaderboard</h3>
            {sortedPlayers.map((player, index) => {
              const playerIndex = players.indexOf(player);
              return (
                <div
                  key={playerIndex}
                  className={`mb-2 p-3 rounded-full text-center font-bold ${
                    index === 0 ? 'bg-yellow-400 text-gray-800' :
                    index === 1 ? 'bg-gray-300 text-gray-800' :
                    index === 2 ? 'bg-yellow-700 text-white' :
                    'bg-gray-600 text-white'
                  }`}
                >
                  {player}: {scores[playerIndex]}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2 text-green-400">Bids</h3>
              {players.map((player, index) => (
                <div key={index} className="mb-2 flex items-center justify-between">
                  <span>{player}:</span>
                  <NumberSelector
                    value={bids[index]}
                    onChange={(value) => updateBid(index, value)}
                    max={currentRound}
                  />
                </div>
              ))}
              <div className="mt-2 font-bold text-blue-400">
                Tricks Remaining: {calculateRemainingTricks()}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2 text-green-400">Tricks</h3>
              {players.map((player, index) => (
                <div key={index} className="mb-2 flex items-center justify-between">
                  <span>{player}:</span>
                  <NumberSelector
                    value={tricks[index]}
                    onChange={(value) => updateTrick(index, value)}
                    max={currentRound}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            <button
              ref={buttonRef}
              onClick={calculateScores}
              disabled={!isValid}
              className={`px-6 py-3 rounded-full font-bold transition duration-300 transform hover:scale-105 ${
                isValid ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-500 text-gray-300 cursor-not-allowed'
              }`}
            >
              {currentRound === totalRounds ? 'End Game' : 'Next Round'}
            </button>
            <button
              onClick={handleQuitGame}
              className="px-6 py-3 rounded-full bg-red-600 text-white font-bold hover:bg-red-700 transition duration-300 transform hover:scale-105"
            >
              Quit Game
            </button>
          </div>

          {!isValid && (
            <p className="text-red-500 mb-4">
              Please ensure all inputs are valid and the sum of tricks equals {currentRound}.
            </p>
          )}

          <div className="bg-gray-700 rounded-lg p-4 overflow-x-auto">
            <h3 className="text-xl font-bold mb-2 text-yellow-400">Round Results</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-600 p-2">Round</th>
                  {players.map((player, index) => (
                    <th key={index} className="border border-gray-600 p-2">{player}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roundResults && roundResults.map((result, roundIndex) => (
                  <tr key={roundIndex}>
                    <td className="border border-gray-600 p-2">{roundIndex + 1}</td>
                    {result.points.map((points, playerIndex) => (
                      <td key={playerIndex} className="border border-gray-600 p-2">
                        {points} ({result.bids[playerIndex]}/{result.tricks[playerIndex]})
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
