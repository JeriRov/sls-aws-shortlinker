export const validateEmail = (email: string): boolean => {
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return RegExp(EMAIL_REGEX).test(email.toLowerCase());
};

export const validatePassword = (password: string): boolean => {
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return RegExp(PASSWORD_REGEX).test(password);
};
