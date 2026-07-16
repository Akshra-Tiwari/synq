import { IUser } from '../modules/users/users.model';

declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
