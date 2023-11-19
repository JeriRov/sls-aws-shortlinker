export type ShortUrl = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userEmail: string;
  visitCount: number;
  creationTime: number;
  shortUrlLifeTime: ShortUrlLifeTime;
  isActive: boolean;
};

export enum ShortUrlLifeTime {
  ONE_TIME = 0,
  ONE_DAY = 1,
  THREE_DAYS = 3,
  SEVEN_DAYS = 7,
}

export type CreateShortUrlRequestBody = {
  originalUrl: string;
  shortUrlLifeTime: ShortUrlLifeTime;
};

export type DeactivateShortUrlParams = {
  shortId: string;
};

export type RedirectShortUrlRequestParams = {
  shortId: string;
};
