import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/AuthProvider";
import Api from "../../api/Api";

const RATE_CACHE = new Map();
const FALLBACK_RATES = {
  CAD_USD: 0.74,
  USD_CAD: 1.35,
  USD_INR: 84.5,
  INR_USD: 0.0118,
  CAD_INR: 68.8,
  INR_CAD: 0.0145,
};
const FX_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

const normalizeCode = (code, fallback = "CAD") => {
  const value = String(code || fallback).toUpperCase();
  return ["CAD", "USD", "INR"].includes(value) ? value : fallback;
};

async function getRate(source, target) {
  const src = normalizeCode(source);
  const dst = normalizeCode(target);
  if (src === dst) return 1;
  const key = `${src}_${dst}`;
  if (RATE_CACHE.has(key)) return RATE_CACHE.get(key);

  const resolveFallback = () => {
    const fb = Number(FALLBACK_RATES[key] || 0);
    return Number.isFinite(fb) && fb > 0 ? fb : 1;
  };

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const localKey = `fx_rate_${key}_${year}_${month}`;
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        const cached = JSON.parse(raw);
        const rate = Number(cached?.rate || 0);
        const ts = Number(cached?.ts || 0);
        if (Number.isFinite(rate) && rate > 0 && Date.now() - ts < FX_CACHE_TTL_MS) {
          RATE_CACHE.set(key, rate);
          return rate;
        }
      }
    }
  } catch {
    // ignore cache read errors
  }

  let finalRate = 0;

  try {
    const res = await Api.get(
      `/fx/rate?source=${encodeURIComponent(src)}&target=${encodeURIComponent(dst)}&month=${month}&year=${year}`
    );
    const rate = Number(res?.data?.rate || 0);
    if (Number.isFinite(rate) && rate > 0) finalRate = rate;
  } catch {
    // fallback to static matrix
  }

  if (!finalRate) finalRate = resolveFallback();
  RATE_CACHE.set(key, finalRate);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(localKey, JSON.stringify({ rate: finalRate, ts: Date.now() }));
    }
  } catch {
    // ignore cache write errors
  }
  return finalRate;
}

export default function Currency({ amount, currency, onlySymbol }) {
  const [finalAmount, setFinalAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { selectedCurrency } = useContext(UserContext);

  useEffect(() => {
    let mounted = true;
    const sourceCurrency = normalizeCode(currency, "CAD");
    const targetCurrency = normalizeCode(selectedCurrency, "CAD");

    const formatOutput = async () => {
      if (!onlySymbol) setLoading(true);
      let displayAmount = Number(amount || 0);
      try {
        const rate = await getRate(sourceCurrency, targetCurrency);
        displayAmount = Number(displayAmount) * Number(rate || 1);
      } catch {
        // Fallback to unconverted amount if rate fetch fails
      }

      if (!mounted) return;

      if (onlySymbol) {
        const parts = new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: targetCurrency,
        })
          .formatToParts(0)
          .find((part) => part.type === "currency");
        setFinalAmount(parts?.value || "");
        setLoading(false);
        return;
      }

      const formattedValue = new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: targetCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(displayAmount);
      setFinalAmount(formattedValue);
      setLoading(false);
    };

    formatOutput();
    return () => {
      mounted = false;
    };
  }, [amount, currency, onlySymbol, selectedCurrency]);

  if (!onlySymbol && loading) {
    return (
      <span className="inline-block min-w-[72px] text-gray-400 animate-pulse">
        Loading...
      </span>
    );
  }

  return finalAmount;
}
