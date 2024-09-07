interface GameOverProps {
  players: string[];
  scores: number[];
}

export default function GameOver({ players, scores }: GameOverProps) {
  const sortedResults = players
    .map((player, index) => ({ name: player, score: scores[index] }))
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-center">Wizard Scorekeeper</h1>
      <h2 className="text-2xl font-bold mb-4">Game Over</h2>
      <h2 className="text-xl font-bold mb-2">Final Scores:</h2>
      {sortedResults.map((result, index) => (
        <div key={index} className="mb-2">
          <span className="font-bold">{index + 1}. {result.name}: {result.score}</span>
        </div>
      ))}
    </div>
  );
}
