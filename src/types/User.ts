export type User = {
  email: string,
  password: string
};

export type UserWithoutPassword = Omit<User, 'password'>;
