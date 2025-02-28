import { useState, useEffect } from 'react';

const useHumanReadableDate = (dateString, includeTime) => {
  const [humanReadableDate, setHumanReadableDate] = useState("");

  useEffect(() => {
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(includeTime && {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }),
    };

    const formattedDate = date.toLocaleString('en-US', options);
    setHumanReadableDate(formattedDate);
  }, [dateString, includeTime]);

  return humanReadableDate;
};

export default function TimeFormat({ date, time = true }) {
  return <>{useHumanReadableDate(date, time)}</>;
}
