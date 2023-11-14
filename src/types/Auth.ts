export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthTokensWithId = AuthTokens & {
  id: string
};

export interface AuthRequest {
  email: string,
  password: string
}
