import generateFields from 'helpers/generateFields';

import { IInitialData } from 'interfaces';

const initialData = (): IInitialData => {
  return {
    users: {
      quantityUsers: 1,
      circle: {
        name: '',
        avatar: '',
        countWinner: 0,
        turn: '',
      },
      cross: {
        name: '',
        avatar: '',
        countWinner: 0,
        turn: '',
      },
    },
    fields: generateFields(),
    typeTurn: 'circle',
    idWinner: [],
    lineWinner: '',
  };
};

export default initialData;
