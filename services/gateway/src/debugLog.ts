export const makeDebugLog = (label: string, count: number) => {
  const logged: string[] = [];

  return (...logs: any[]) => {
    for (const log of logs) {
      logged.push(log);
      if (logged.length >= count) {
        if (process.env.DEBUG === 'true') console.log(`[${label.toString()}]`, ...logged);
        break;
      }
    }
  };
};
