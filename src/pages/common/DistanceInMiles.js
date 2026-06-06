export default function DistanceInMiles({ d }) {
  const km = Number(d || 0);
  const miles = km * 0.6214;
  return <>{`${miles.toFixed(2)} mi (${km.toFixed(2)} km)`}</>;
}
