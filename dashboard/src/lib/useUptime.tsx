export function useUptime(time?: Date) {
  if (!time) {
    return undefined;
  }

  function period(seconds: number) {
    let secs = seconds;
    const weeks = Math.floor(secs / (7 * 24 * 60 * 60));
    secs -= weeks * 7 * 24 * 60 * 60;
    const days = Math.floor(secs / (24 * 60 * 60));
    secs -= days * 24 * 60 * 60;
    const hours = Math.floor(secs / (60 * 60));
    secs -= hours * 60 * 60;
    const mins = Math.floor(secs / 60);
    secs -= mins * 60;
    return { weeks, days, hours, mins, secs };
  }

  const { weeks, days, hours, mins } = period(
    (new Date().getTime() - time.getTime()) / 1000
  );
  let result = "";
  if (weeks) result += weeks + "w";
  if (days || weeks) result += days + "d";
  if (hours || days || weeks) result += ("00" + hours).slice(-2) + "h";
  result += ("00" + mins).slice(-2) + "m";
  return result;
}
