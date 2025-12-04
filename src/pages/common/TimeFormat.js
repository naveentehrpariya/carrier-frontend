import { useState, useEffect } from 'react';

const useHumanReadableDate = (dateString, includeTime) => {
  const [humanReadableDate, setHumanReadableDate] = useState("");

  useEffect(() => {
    if (!dateString) {
      setHumanReadableDate("");
      return;
    }
    const isDateOnly = typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    const date = isDateOnly ? new Date(`${dateString}T00:00:00Z`) : new Date(dateString);
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
  }, [dateString, includeTime]);

  return humanReadableDate;
};

export default function TimeFormat({ date, time = true }) {
  return <>{useHumanReadableDate(date, time)}</>;
}
