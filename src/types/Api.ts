export type AuthRequestBody = {
  email: string;
  password: string;
};

export type AuthResponseBody = {
  success: boolean,
  data: {
    email: string
    accessToken: string;
    refreshToken: string;
  }
};

export type ErrorResponse = string;

export type CreateUrlRequestBody = {
  originalUrl: string;
};

export type ShortUrlResponseBody = {
  success: boolean;
  data:{
    id: string;
    originalUrl: string;
    shortUrl: string;
    userEmail: string;
    visitCount: number;
    creationTime: number;
    expirationDays: number;
  }
};

export type MyUserResponseBody = {
  success: boolean;
  data: MyUserResponseShortUrl[];
};

export type MyUserResponseShortUrl = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userEmail: string;
  visitCount: number;
  creationTime: number;
  expirationDays: number;
};

export type RedirectUrlRequestPathParams = {
  shortId: string;
};

export type InvalidTokenResponse = {
  message: string;
};
