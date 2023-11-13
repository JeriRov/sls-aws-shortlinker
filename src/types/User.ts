export type User = {
    id: string,
    email: string,
    password: string
}
export type UserWithoutPassword = Omit<User, 'password'>;
