import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript } from '../utils/googleMapsLoader';

// Pull a single address_components entry by type.
function getComponent(components, type, useShort = false) {
  const match = (components || []).find((c) => (c.types || []).includes(type));
  if (!match) return '';
  return useShort ? match.short_name : match.long_name;
}

// Parse a Google Place into discrete address fields (street-only line1 + columns).
function parsePlace(place) {
  const components = place?.address_components || [];
  const streetNumber = getComponent(components, 'street_number');
  const route = getComponent(components, 'route');
  const street = [streetNumber, route].filter(Boolean).join(' ').trim();

  const isBusinessType = place?.types && (
    place.types.includes('establishment') ||
    place.types.includes('point_of_interest') ||
    place.types.includes('store') ||
    place.types.includes('shopping_mall') ||
    place.types.includes('premise')
  );
  // Street-only address line: street for residential, business name otherwise.
  let line1 = street;
  if (!line1 && place?.name) line1 = place.name;
  if (isBusinessType && place?.name && place.name !== line1) {
    line1 = street ? `${place.name}, ${street}` : place.name;
  }

  const city = getComponent(components, 'locality')
    || getComponent(components, 'postal_town')
    || getComponent(components, 'sublocality')
    || getComponent(components, 'administrative_area_level_2');

  return {
    line1: line1 || place?.formatted_address || '',
    city,
    state: getComponent(components, 'administrative_area_level_1'),
    country: getComponent(components, 'country'),
    countryCode: getComponent(components, 'country', true),
    zipcode: getComponent(components, 'postal_code'),
  };
}

export default function GoogleAddressInput({ value, onChange, onAddressSelect, placeholder = 'Address', className = 'input-sm' }) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
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
      autocompleteInstance.setFields(['formatted_address', 'name', 'types', 'address_components']);
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        const parsed = parsePlace(place);
        // Address field holds the street-only line; columns flow via onAddressSelect.
        setText(parsed.line1);
        onChange && onChange(parsed.line1);
        onAddressSelect && onAddressSelect(parsed);
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

