export const massAssign = <T, D>(target: T, targetKeys: (keyof T)[], data: D, dataKeys: (keyof D)[] = targetKeys as any): T => {
  for (let i = 0; i < targetKeys.length; i++) {
    target[targetKeys[i]] = data[dataKeys[i]] as any;
  }

  return target;
};
