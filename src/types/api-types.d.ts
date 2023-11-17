export type AuthRequestBody = {
  email: string,
  password: string
};
export type AuthResponseBody = {
  success: true;
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
  success: true;
  data: {
    id: string;
    originalUrl: string;
    shortUrl: string;
    userEmail: string;
  }
};
export type RedirectUrlRequestParams = {
  shortId: string;
};
export type InvalidTokenResponse = {
  message: string;
};
