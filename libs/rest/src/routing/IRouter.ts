import type { File, StringRecord, RequestBodyData } from '../Fetch';

export type IRouter = {
  get<T, Q = StringRecord>(options?: { query?: Q }): Promise<T>;
  delete<T, D = RequestBodyData>(options?: { data?: D; reason?: string }): Promise<T>;
  patch<T, D = RequestBodyData>(options: { data: D; reason?: string }): Promise<T>;
  put<T, D = RequestBodyData>(options?: { data?: D; reason?: string }): Promise<T>;
  post<T, D = RequestBodyData, Q = StringRecord>(options: { data: D; reason?: string; files?: File[]; query?: Q }): Promise<T>;
} & { [key: string]: IRouter };
