import { useState, useEffect, useCallback } from 'react';

interface RoundResult {
  bids: number[];
  tricks: number[];
  points: number[];
}

interface GameState {
  players: string[];
  scores: number[];
  currentRound: number;
  roundResults: RoundResult[];
  totalRounds: number;
  currentDealerIndex: number;
}

const calculateTotalRounds = (playerCount: number) => Math.floor(60 / playerCount);

export function useGameManager(initialPlayers: string[]) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedState = localStorage.getItem('wizardGameState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      players: initialPlayers,
      scores: new Array(initialPlayers.length).fill(0),
      currentRound: 1,
      roundResults: [],
      totalRounds: calculateTotalRounds(initialPlayers.length),
      currentDealerIndex: 0,  // Always start with the first player as dealer
    };
  });

  useEffect(() => {
    localStorage.setItem('wizardGameState', JSON.stringify(gameState));
  }, [gameState]);

  const updateScores = useCallback((bids: number[], tricks: number[]) => {
    const newScores = gameState.scores.map((score, index) => {
      if (bids[index] === tricks[index]) {
        return score + 20 + tricks[index] * 10;
      } else {
        return score - Math.abs(bids[index] - tricks[index]) * 10;
      }
    });

    const roundPoints = newScores.map((newScore, index) => newScore - gameState.scores[index]);
    const newRoundResult: RoundResult = { bids, tricks, points: roundPoints };

    setGameState(prevState => ({
      ...prevState,
      scores: newScores,
      currentRound: prevState.currentRound < prevState.totalRounds ? prevState.currentRound + 1 : prevState.currentRound,
      roundResults: [...prevState.roundResults, newRoundResult],
      currentDealerIndex: (prevState.currentDealerIndex + 1) % prevState.players.length,
    }));
  }, [gameState]);

  const resetGame = useCallback(() => {
    const initialState: GameState = {
      scores: new Array(initialPlayers.length).fill(0),
      currentRound: 1,
      roundResults: [],
      totalRounds: calculateTotalRounds(initialPlayers.length),
      players: initialPlayers,
      currentDealerIndex: 0,  // Reset to the first player as dealer
    };
    setGameState(initialState);
    localStorage.setItem('wizardGameState', JSON.stringify(initialState));
  }, [initialPlayers]);

  return {
    gameState,
    updateScores,
    resetGame,
  };
}