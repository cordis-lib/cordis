import type { File, StringRecord, RequestBodyData } from '@cordis/rest';

export type IRouter = {
  get<T, Q extends StringRecord | string = StringRecord>(options?: { query?: Q }): Promise<T>;
  delete<T, D extends RequestBodyData = RequestBodyData>(options?: { data?: D; reason?: string }): Promise<T>;
  patch<T, D extends RequestBodyData>(options: { data: D; reason?: string }): Promise<T>;
  put<T, D extends RequestBodyData>(options: { data: D; reason?: string }): Promise<T>;
  post<T, D extends RequestBodyData>(options: { data: D; reason?: string; files?: File[] }): Promise<T>;
} & { [key: string]: IRouter };
