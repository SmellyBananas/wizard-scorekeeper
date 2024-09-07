import { useState, useEffect, useRef } from "react";
import { useGameManager } from "../utils/GameManager";

interface GameScreenProps {
  players: string[];
  onGameEnd: () => void;
}

export default function GameScreen({ players, onGameEnd }: GameScreenProps) {
  const { gameState, updateScores } = useGameManager(players);
  const { scores, currentRound, roundResults, totalRounds } = gameState;
  const [bids, setBids] = useState<number[]>(new Array(players.length).fill(0));
  const [tricks, setTricks] = useState<number[]>(new Array(players.length).fill(0));
  const [isValid, setIsValid] = useState<boolean>(true);

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

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 p-4 pb-8">
        <div className="max-w-md mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-orange-500 drop-shadow-lg">W</span>
              <span className="text-orange-400">IZARD WHIZ</span>
            </h1>
            <h2 className="text-2xl text-blue-500 font-semibold">Live Scorekeeper</h2>
          </header>
        </div>
      </div>

      <div className="bg-white p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8 -mt-16">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            {players.map((player, index) => (
              <div
                key={index}
                className={`mb-2 p-3 rounded-full text-center font-bold ${
                  index === 0 ? 'bg-yellow-400' :
                  index === 1 ? 'bg-gray-300' :
                  index === 2 ? 'bg-yellow-700' :
                  'bg-white border border-gray-300'
                }`}
              >
                {player}: {scores[index]}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold mb-4">Round {currentRound} of {totalRounds}</h2>
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
                  {roundResults.map((result, roundIndex) => (
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
