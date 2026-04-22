import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';

export default function GoogleAddressInput({ value, onChange, placeholder = 'Address', className = 'input-sm' }) {
  const apiKey = 'AIzaSyARl049FrKlkbob8QImlI5LAa8QmzReNBw';
  const inputRef = useRef(null);
  const [text, setText] = useState(value || '');

  useEffect(() => {
    setText(value || '');
  }, [value]);

  useEffect(() => {
    let autocompleteInstance;
    loadGoogleMapsScript(apiKey).then(() => {
      if (!inputRef.current) return;
      autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
      autocompleteInstance.setFields(['formatted_address', 'name', 'types']);
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        const formatted = place?.formatted_address || '';
        let locationString = formatted;
        if (place?.name && place.name !== formatted) {
          const isBusinessType = place.types && (
            place.types.includes('establishment') ||
            place.types.includes('point_of_interest') ||
            place.types.includes('store') ||
            place.types.includes('shopping_mall') ||
            place.types.includes('warehouse') ||
            place.types.includes('storage') ||
            place.types.includes('logistics') ||
            place.types.includes('premise')
          );
          locationString = isBusinessType ? `${place.name}, ${formatted}` : formatted;
        }
        setText(locationString);
        onChange && onChange(locationString);
      });
    });
    return () => {
      autocompleteInstance = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      className={className}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange && onChange(e.target.value);
      }}
      placeholder={placeholder}
      type="text"
    />
  );
}

