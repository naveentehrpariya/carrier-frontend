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

// Owner suffix for a truck option: " • Owner: <name>". An order can be split across several owners,
// so the dropdown has to say WHICH owner a truck settles to — not just that it is owner operated.
export function getTruckOwnerSuffix(t) {
  if (!t?.ownerOperated) return '';
  const owner = t.ownerOperator;
  const name = (typeof owner === 'object' ? (owner?.fullName || owner?.name || owner?.companyName) : '') || '';
  return name ? ` • Owner: ${name}` : ' • Owner Operated';
}
