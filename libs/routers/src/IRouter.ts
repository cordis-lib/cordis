import type { File, StringRecord } from '@cordis/rest';

export type IRouter = {
  get<T>(options?: { query?: StringRecord }): T;
  delete<T>(options?: { data?: StringRecord; reason?: string }): T;
  patch<T>(options: { data: StringRecord; reason?: string }): T;
  put<T>(options: { data: StringRecord; reason?: string }): T;
  post<T>(options: { data: StringRecord; reason?: string; files: File[] }): T;
} & { [key: string]: IRouter };
