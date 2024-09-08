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
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 p-4 pb-8">
        <div className="max-w-md mx-auto flex justify-center items-center h-full">
          <Image src="/logo.png" alt="Game Logo" width={200} height={100} />
        </div>
      </div>

      <div className="bg-white p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 -mt-16">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            {sortedPlayers.map((player, index) => {
              const playerIndex = players.indexOf(player);
              return (
                <div
                  key={playerIndex}
                  className={`mb-2 p-3 rounded-full text-center font-bold ${
                    index === 0 ? 'bg-yellow-400' :
                    index === 1 ? 'bg-gray-300' :
                    index === 2 ? 'bg-yellow-700' :
                    'bg-white border border-gray-300'
                  }`}
                >
                  {player}: {scores[playerIndex]}
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">Round {currentRound} of {totalRounds}</h2>
            <p className="text-lg font-semibold mb-2">Current Dealer: {players[currentDealerIndex]}</p>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Bids</h2>
              {players.map((player, index) => (
                <div key={index} className="mb-2">
                  <label>{player}: </label>
                  <NumberSelector
                    value={bids[index]}
                    onChange={(value) => updateBid(index, value)}
                    max={currentRound}
                  />
                </div>
              ))}
              <div className="mt-2 font-bold text-blue-600">
                Tricks Remaining: {calculateRemainingTricks()}
              </div>
            </div>
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Tricks</h2>
              {players.map((player, index) => (
                <div key={index} className="mb-2">
                  <label>{player}: </label>
                  <NumberSelector
                    value={tricks[index]}
                    onChange={(value) => updateTrick(index, value)}
                    max={currentRound}
                  />
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <button
                ref={buttonRef}
                onClick={calculateScores}
                disabled={!isValid}
                className={`px-4 py-2 rounded ${
                  isValid ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentRound === totalRounds ? 'End Game' : 'Next Round'}
              </button>
              <button
                onClick={handleQuitGame}
                className="px-4 py-2 rounded bg-red-500 text-white"
              >
                Quit Game
              </button>
            </div>
            {!isValid && (
              <p className="text-red-500 mt-2">
                Please ensure all inputs are valid and the sum of tricks equals {currentRound}.
              </p>
            )}
            
            {/* New table for round results */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2">Round</th>
                    {players.map((player, index) => (
                      <th key={index} className="border p-2">{player}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roundResults && roundResults.map((result, roundIndex) => (
                    <tr key={roundIndex}>
                      <td className="border p-2">{roundIndex + 1}</td>
                      {result.points.map((points, playerIndex) => (
                        <td key={playerIndex} className="border p-2">
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
    </div>
  );
}
