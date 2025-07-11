export interface IApiSuccessResponse<T = any> {
  error: false;
  data: T;
}

export interface IApiErrorResponse {
  error: true;
  message: string;
}

export type IApiResponse<T = any> = IApiSuccessResponse<T> | IApiErrorResponse;
