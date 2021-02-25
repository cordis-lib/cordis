import type { File, StringRecord, RequestBodyData } from '@cordis/rest';

export type IRouter = {
  get<T, Q extends StringRecord | string = StringRecord>(options?: { query?: Q }): T;
  delete<T, D extends RequestBodyData = RequestBodyData>(options?: { data?: D; reason?: string }): T;
  patch<T, D extends RequestBodyData>(options: { data: D; reason?: string }): T;
  put<T, D extends RequestBodyData>(options: { data: D; reason?: string }): T;
  post<T, D extends RequestBodyData>(options: { data: D; reason?: string; files?: File[] }): T;
} & { [key: string]: IRouter };
