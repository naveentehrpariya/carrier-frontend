import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const MapComponent = ({ order }) => {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  useEffect(() => {
    const locationsArray = order?.shipping_details?.[0]?.locations
      ?.filter(item => item.location)
      .map(item => item.location) || [];
    setLocations(locationsArray);
  }, [order]);

  const calculateRoute = useCallback(async () => {
    if (locations.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, -1).map(loc => ({
      location: loc,
      stopover: true,
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);

          // Fit the map to the route
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            result.routes[0].legs.forEach((leg) => {
              bounds.extend(leg.start_location);
              bounds.extend(leg.end_location);
            });
            mapRef.current.fitBounds(bounds);
          }
        } else {
          console.error("Directions request failed", result);
        }
      }
    );
  }, [locations]);

  useEffect(() => {
    if (locations.length > 1) {
      calculateRoute();
    }
  }, [locations, calculateRoute]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        onLoad={handleMapLoad}
        // 🟢 Do NOT set center or zoom here
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
  );
};

export default MapComponent;
