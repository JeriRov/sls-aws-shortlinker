import createHttpError from 'http-errors';

export const validateEmail = (email: string): boolean => {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return RegExp(EMAIL_REGEX).test(email.toLowerCase());
};

export const validatePassword = (password: string): boolean => {
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  return RegExp(PASSWORD_REGEX).test(password);
};

export const validateCredentials = (email: string, password: string, avoidPassword = false) => {
  if (!email || !password) {
    throw new createHttpError.BadRequest('Email and password are required!');
  }

  if (!validateEmail(email)) {
    throw new createHttpError.Conflict('Invalid email');
  }

  if (!avoidPassword && !validatePassword(password)) {
    throw new createHttpError.Conflict('The password must contain a minimum of eight characters, at least one letter, and one number');
  }
};

export const validateUrl = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
};
