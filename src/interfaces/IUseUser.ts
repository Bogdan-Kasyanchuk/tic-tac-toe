import { Auth, User } from 'firebase/auth';

import type { TUser } from 'types';

export interface IUseUser {
  auth: Auth;
  user: User | null | undefined;
  displayName: TUser['name'];
  photoURL: TUser['avatar'];
  loading: boolean;
}
