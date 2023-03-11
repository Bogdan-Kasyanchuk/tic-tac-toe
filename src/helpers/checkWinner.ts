import type { TField, TIdWinner, TLineWinner } from 'types';

const checkWinner = (fields: TField[]): { winnerType: TLineWinner; winnerId: TIdWinner } => {
  const lines: number[][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winnerType: TLineWinner = '';
  const winnerId: TIdWinner = [];

  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];
    if (fields[a].type && fields[a].type === fields[b].type && fields[a].type === fields[c].type) {
      for (let k = 0; k < [a, b, c].length; k += 1) {
        winnerId.push(fields[[a, b, c][k]].id);
      }

      if (i >= 0 && i <= 2) {
        winnerType = 'horizontal';
      } else if (i >= 3 && i <= 5) {
        winnerType = 'vertical';
      } else if (i === 6) {
        winnerType = 'rotate_45';
      } else {
        winnerType = 'rotate_-45';
      }
      break;
    }
  }

  return { winnerType, winnerId };
};

export default checkWinner;
