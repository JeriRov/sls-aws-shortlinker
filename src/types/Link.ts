export type Link = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  userId: string;
};

export type CreateLinkRequest = Pick<Link, 'originalUrl'>;
export type RedirectLinkRequest = {
  shortId: string;
};
