import { useEffect, useState } from "react";
import moment from "moment";

export function useRelativeTime(time?: Date): string | undefined {
  let timer: number | undefined = undefined;
  const [formatted, setFormatted] = useState<string | undefined>();

  function updateTime() {
    if (time) {
      if (moment().diff(time) < 60000) {
        setFormatted(Math.trunc(moment().diff(time) / 1000) + " seconds ago");
        timer = setTimeout(updateTime, 500);
      } else {
        setFormatted(moment(time).fromNow());
        timer = setTimeout(updateTime, 30000);
      }
    } else {
      setFormatted(undefined);
    }
  }

  useEffect(() => {
    updateTime();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [time]);

  return formatted;
}
