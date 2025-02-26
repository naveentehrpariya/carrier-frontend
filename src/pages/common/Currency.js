import React, { useEffect, useState } from "react";

export default function Currency({ amount, currency, onlySymbol }) {
  const [finalAmount, setFinalAmount] = useState("");

  useEffect(() => {
    if (onlySymbol) {
      // Extract currency symbol using Intl.NumberFormat
      const parts = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
      })
        .formatToParts(0)
        .find((part) => part.type === "currency");

      setFinalAmount(parts?.value || "");
    } else {
      const formattedValue = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      setFinalAmount(formattedValue);
    }
  }, [amount, currency, onlySymbol]);

  return finalAmount;
}
