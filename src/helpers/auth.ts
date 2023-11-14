import { Secret, sign } from 'jsonwebtoken';
import { AuthTokensWithId } from '../types/Auth';
import { User, UserWithoutPassword } from '../types/User';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const JWT_SECRET = process.env.JWT_SECRET as Secret;
export const generateTokens = (user: User | UserWithoutPassword): AuthTokensWithId => {
  const payload: UserWithoutPassword = {
    id: user.id,
    email: user.email,
  };
  const accessToken = sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = sign(payload, JWT_SECRET);

  return {
    id: user.id,
    accessToken,
    refreshToken,
  };
};
