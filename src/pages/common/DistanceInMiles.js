export default function DistanceInMiles({ d}) {
  return <>{d ? ((d / 1609.34).toFixed(2)) : '0'}Miles</>;
}
