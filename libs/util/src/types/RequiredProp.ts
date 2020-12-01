// ? Can only have one object signature per `type` declaration; so we use two types and unify them.

type RequiredFilter<T, K extends keyof T> = {
  [P in K]-?: T[P];
};

type ReapplyFilter<T> = {
  [P in keyof T]: T[P];
};

export type RequiredProp<T, K extends keyof T = keyof T> = ReapplyFilter<T> & RequiredFilter<T, K>;
