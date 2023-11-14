import { nanoid } from 'nanoid';

export const createShortId = (length = 5) => nanoid(length);
