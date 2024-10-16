import React from 'react'

export default function CurrencyFormat() {
   const formatCurrency = (amount, currency = 'USD', locale = 'en-US',) => {
      return new Intl.NumberFormat(locale, {
         style: 'currency',
         currency: currency,
      }).format(amount);
   };
 
   return formatCurrency
}
