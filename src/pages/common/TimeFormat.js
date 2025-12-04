import { useState, useEffect } from 'react';

const useHumanReadableDate = (input, includeTime) => {
  const [humanReadableDate, setHumanReadableDate] = useState("");

  useEffect(() => {
    if (input === null || input === undefined || input === "") {
      setHumanReadableDate("");
      return;
    }

    const isDateOnly = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input);
    let date;
    if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else if (isDateOnly) {
      date = new Date(`${input}T00:00:00Z`);
    } else {
      date = new Date(input);
    }

    if (isNaN(date.getTime())) {
      setHumanReadableDate("");
      return;
    }

    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
      ...(isDateOnly && { timeZone: 'UTC' })
    };

    const formattedDate = date.toLocaleString(undefined, options);
    setHumanReadableDate(formattedDate);
  }, [input, includeTime]);

  return humanReadableDate;
};

export default function TimeFormat({ date, time = true }) {
  return <>{useHumanReadableDate(date, time)}</>;
}
