export type Url = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userEmail: string;
  visitCount: number;
  creationTime: number;
  expirationDays: UrlExpirationTime;
};

export enum UrlExpirationTime {
  ONE_TIME = 0,
  ONE_DAY = 1,
  THREE_DAYS = 3,
  SEVEN_DAYS = 7,
}

export type CreateUrlRequestBody = {
  originalUrl: string;
  expirationDays: UrlExpirationTime;
};
export type RedirectUrlRequestParams = {
  shortId: string;
};
