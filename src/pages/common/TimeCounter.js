import React, { useState, useEffect } from 'react';
const TimeCounter = ({date}) => {

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const intervalId = setInterval(() => {
      const endDate = new Date(date || '2024-05-25T12:36:15.929Z');
      const now = new Date();
      const timeDifference = endDate - now;
      if (timeDifference <= 0) {
        clearInterval(intervalId);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      //   const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {timeLeft.days > 0 ? <>{timeLeft.days} days</> : ""} {timeLeft.hours} hr
    </>
  );
};

export default TimeCounter;
