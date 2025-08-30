export interface IApiSuccessResponse<T = any> {
  error: boolean;
  data: T;
}

export interface IApiListSuccessResponse<T = any> {
  error: boolean;
  total: number;
  data: T[];
}

export interface IApiErrorResponse {
  error: boolean;
  message: string;
}

export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;

export type IApiListResponse<T = any> =
  | IApiListSuccessResponse<T>
  | IApiErrorResponse;
