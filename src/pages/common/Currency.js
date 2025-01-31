import React, { useEffect, useState } from 'react';

export default function Currency ({amount, currency}){
   const [finalamount, setfinalamount] = useState();
   useEffect(()=>{ 
      const formattedValue = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      setfinalamount(formattedValue)
  },[amount, amount])
  return finalamount
};
 
