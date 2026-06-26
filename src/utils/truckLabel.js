// Shared truck display label.
// Format: "Make||Model (TruckNo||UnitNumber||PlateNo)"
// - primary: make, fallback to model
// - identifier (in parens): truckNumber, fallback unitNumber, fallback plateNumber
export function getTruckLabel(t, fallback = '—') {
  if (!t) return fallback;
  const primary = t.make || t.model || '';
  const id = t.truckNumber || t.unitNumber || t.plateNumber || '';
  const label = [primary, id ? `(${id})` : ''].filter(Boolean).join(' ').trim();
  return label || fallback;
}
