export type AuthRequestBody = {
  email: string,
  password: string
};

export type AuthResponseBody = {
  success: boolean;
  data: {
    email: string;
    accessToken: string;
    refreshToken: string;
  };
};

export type ErrorResponse = string;

export type CreateUrlRequestBody = {
  originalUrl: string;
};

export type CreateUrlResponseBody = {
  success: boolean;
  data: {
    id: string;
    originalUrl: string;
    shortUrl: string;
    userEmail: string;
    visitCount: number;
    creationTime: number;
    expirationDays: number;
  }
};

export type RedirectUrlRequestParams = {
  shortId: string;
};

export type InvalidTokenResponse = {
  message: string;
};
