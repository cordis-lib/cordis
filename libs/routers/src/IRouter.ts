import type { File, StringRecord } from '@cordis/rest';

export type IRouter = {
  get<T, Q extends StringRecord | string = StringRecord>(options?: { query?: Q }): T;
  delete<T, D extends StringRecord = StringRecord>(options?: { data?: D; reason?: string }): T;
  patch<T, D extends StringRecord>(options: { data: D; reason?: string }): T;
  put<T, D extends StringRecord>(options: { data: D; reason?: string }): T;
  post<T, D extends StringRecord>(options: { data: D; reason?: string; files?: File[] }): T;
} & { [key: string]: IRouter };
