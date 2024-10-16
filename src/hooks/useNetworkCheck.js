import { useState } from "react";
import { useEffect } from "react";

export default function useNetworkCheck() {

  const [speed, setSpeed] = useState(0);
  const imageAddr = 'https://d229fik5nto85b.cloudfront.net/defaults/avatar1234.jpg';
  const downloadSize = 410000; 
  let startTime, endTime;

  async function speedTest() {
      startTime = (new Date()).getTime();
      const cacheBuster = '?nnn=' + startTime;
      const download = new Image();
      download.src = imageAddr + cacheBuster;
      await download.decode();
      endTime = (new Date()).getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = downloadSize * 8; 
      const speedBps = (bitsLoaded / duration).toFixed(2);
      const speedKbps = (speedBps / 1024).toFixed(2);
      const speedMbps = (speedKbps / 1024).toFixed(2);
      const mb = Math.round(Number(speedMbps));
      setSpeed(mb);
      console.log("user network check", Math.round(Number(speedMbps)))
      return Math.round(Number(speedMbps));
  }
  
  useEffect(()=> {
    speedTest();
    setSpeed(speed);
  }, [speed]);

  return speed;
}