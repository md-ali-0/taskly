export type TMeta = {
  limit?: number;
  page?: number;
  total?: number;
  totalPage?: number;
  hasMore?: boolean;
  nextCursor?: string | null;
};

export type TError = {
  data: {
    message: string;
    success?: boolean;
    error?: unknown;
  };
  status: number;
};

export type TResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  meta?: TMeta;
  error?: TError;
};
