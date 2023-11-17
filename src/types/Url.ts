export type Url = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userEmail: string;
};

export type CreateUrlRequestBody = Pick<Url, 'originalUrl'>;
export type RedirectUrlRequestParams = {
  shortId: string;
};
