import type { TField, TIdWinner, TLineWinner, TQuantityUsers, TTypeTurn, TUser } from 'types';

export interface IInitialData {
  users: {
    quantityUsers: TQuantityUsers;
    circle: TUser;
    cross: TUser;
  };
  fields: TField[];
  typeTurn: TTypeTurn;
  idWinner: TIdWinner;
  lineWinner: TLineWinner;
}
