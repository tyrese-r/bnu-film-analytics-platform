export type CustomError = Error & {
  statusCode?: number;
  code?: string;
};

export const HttpError = (
  message: string,
  statusCode: number = 500,
  code?: string
) => {
  const error = new Error(message) as CustomError;

  error.statusCode = statusCode;
  error.code = code;
  error.name = "HTTP ERROR";

  return error;
};
