import { useState, useEffect } from 'react';

const useHumanReadableDate = (string) => {

  const [humanReadableDate, setHumanReadableDate] = useState("");
  useEffect(() => {
    const date = new Date(string);
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      // timeZoneName: 'short'
    };
    const formattedDate = date.toLocaleString('en-US', options);
    setHumanReadableDate(formattedDate);
  }, [string]);

  return humanReadableDate;
};

export default function TimeFormat({date}) {
  return <>{useHumanReadableDate(date)}</> ;
}
