import { useState, useEffect, useRef } from "react";

interface GameScreenProps {
  players: string[];
  scores: number[];
  setScores: React.Dispatch<React.SetStateAction<number[]>>;
  onGameEnd: () => void;
}

interface RoundResult {
  bids: number[];
  tricks: number[];
  points: number[];
}

export default function GameScreen({ players, scores, setScores, onGameEnd }: GameScreenProps) {
  const totalRounds = Math.floor(60 / players.length);
  const [currentRound, setCurrentRound] = useState(1);
  const [bids, setBids] = useState<number[]>(new Array(players.length).fill(0));
  const [tricks, setTricks] = useState<number[]>(new Array(players.length).fill(0));
  const [isValid, setIsValid] = useState<boolean>(true);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);

  const buttonRef = useRef<HTMLButtonElement>(null);

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

    const newScores = scores.map((score, index) => {
      if (bids[index] === tricks[index]) {
        return score + 20 + tricks[index] * 10;
      } else {
        return score - Math.abs(bids[index] - tricks[index]) * 10;
      }
    });
    setScores(newScores);

    const roundPoints = newScores.map((newScore, index) => newScore - scores[index]);
    setRoundResults([...roundResults, { bids, tricks, points: roundPoints }]);

    if (currentRound === totalRounds) {
      onGameEnd();
    } else {
      setCurrentRound(currentRound + 1);
      setBids(new Array(players.length).fill(0));
      setTricks(new Array(players.length).fill(0));
    }
  };

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

  const leaderIndex = scores.indexOf(Math.max(...scores));

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
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Wizard Scorekeeper</h1>
      <h2 className="text-2xl font-bold mb-4">Round {currentRound} of {totalRounds}</h2>
      <div className="mb-4">
        <div 
          className="w-full p-2 mb-2 text-white text-center"
          style={{ backgroundColor: getRandomColor() }}
        >
          <span className="text-2xl font-bold">{players[leaderIndex]}: {scores[leaderIndex]}</span>
        </div>
        {players.map((player, index) => (
          index !== leaderIndex && (
            <div key={index} className="mb-2">
              <span className="font-bold">{player}: {scores[index]}</span>
            </div>
          )
        ))}
      </div>
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
        Next Round
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
  );
}
