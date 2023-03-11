import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { useLocation } from 'react-router-dom';

import db from 'service/firebaseDB';

import type { TField, TIdWinner, TLineWinner, TQuantityUsers, TTypeTurn, TUser } from 'types';

const useData = () => {
  const { state } = useLocation();
  const [data] = useDocumentData(doc(db, 'games', state.id));

  const circle: TUser = data?.users.circle;
  const cross: TUser = data?.users.cross;
  const fields: TField[] = data?.fields;
  const typeTurn: TTypeTurn = data?.typeTurn;
  const idWinner: TIdWinner = data?.idWinner;
  const lineWinner: TLineWinner = data?.lineWinner;
  const quantityUsers: TQuantityUsers = data?.users.quantityUsers;

  return { circle, cross, fields, typeTurn, idWinner, lineWinner, quantityUsers };
};

export default useData;
