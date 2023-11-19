import { Secret, sign } from 'jsonwebtoken';
import { ListIdentitiesCommand, VerifyEmailIdentityCommand } from '@aws-sdk/client-ses';
import { AuthTokensWithEmail } from '../types/Auth';
import { User, UserWithoutPassword } from '../types/User';
import { getSESClient } from '../helpers/providers';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
const JWT_SECRET = process.env.JWT_SECRET as Secret;

export const generateTokens = (user: User | UserWithoutPassword): AuthTokensWithEmail => {
  const payload: UserWithoutPassword = {
    email: user.email,
  };
  const accessToken = sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = sign(payload, JWT_SECRET);

  return {
    email: user.email,
    accessToken,
    refreshToken,
  };
};

export const verifyEmail = async (email: string) => {
  try {
    const sesClient = getSESClient();
    const listIdentitiesResponse = await sesClient.send(
      new ListIdentitiesCommand({}),
    );

    console.log('listIdentitiesResponse', listIdentitiesResponse);
    const verifiedEmails = listIdentitiesResponse.Identities ?? [];

    if (!verifiedEmails.includes(email)) {
      await sesClient.send(
        new VerifyEmailIdentityCommand({ EmailAddress: email }),
      );
      console.log(`Email ${email} has been verified.`);
    } else {
      console.log(`Email ${email} is already verified.`);
    }
  } catch (error) {
    console.error(`Error verifying ${email}:`, error);
  }
};
