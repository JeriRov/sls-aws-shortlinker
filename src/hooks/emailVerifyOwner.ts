import { verifyEmail } from '../libs/auth';
import { EMAIL } from '../helpers/helpers';

export const emailVerifyOwner = async () => {
  try {
    await verifyEmail(EMAIL);

    return '[emailVerifyOwner]: Message sent or already verified';
  } catch (error) {
    console.log(error);

    return `[emailVerifyOwner]: Error while verifying email: ${error}`;
  }
};
