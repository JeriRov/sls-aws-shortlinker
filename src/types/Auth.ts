export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthTokensWithEmail = AuthTokens & {
  email: string
};

export interface AuthRequestBody {
  email: string,
  password: string
}

export type AuthContext = {
  email: string
};
