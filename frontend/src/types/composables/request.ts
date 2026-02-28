export type AuthorizedRequest = <T>(operation: (token: string) => Promise<T>) => Promise<T>;

export type RequestErrorHandler = (error: unknown, fallbackMessage: string) => void;
