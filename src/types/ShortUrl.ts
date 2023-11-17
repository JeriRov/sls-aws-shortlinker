export type ShortUrl = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userEmail: string;
  visitCount: number;
  creationTime: number;
  expirationDays: ShortUrlExpirationDay;
};

export enum ShortUrlExpirationDay {
  ONE_TIME = 0,
  ONE_DAY = 1,
  THREE_DAYS = 3,
  SEVEN_DAYS = 7,
}

export type CreateShortUrlRequestBody = {
  originalUrl: string;
  expirationDays: ShortUrlExpirationDay;
};

export type DeactivateShortUrlParams = {
  shortId: string;
};

export type RedirectShortUrlRequestParams = {
  shortId: string;
};
