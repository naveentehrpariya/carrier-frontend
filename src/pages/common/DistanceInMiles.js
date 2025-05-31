export default function DistanceInMiles({ d}) {
  return <>{d ? ((d * 0.6214).toFixed(2)) : '0'}Miles</>;
}
