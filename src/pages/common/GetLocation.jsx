import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader"; // adjust path as needed

export default function GetLocation({ index, onchange, placeholder, id, initialValue }) {
  const apiKey = 'AIzaSyARl049FrKlkbob8QImlI5LAa8QmzReNBw';
  const inputRef = useRef(null);
 const [inputText, setInputText] = useState(initialValue || "");

  useEffect(() => {
    let autocompleteInstance;

    loadGoogleMapsScript(apiKey).then(() => {
      if (inputRef.current) {
        autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
        autocompleteInstance.setFields([
          "formatted_address", 
          "name", 
          "business_status", 
          "types",
          "place_id",
          "geometry"
        ]);

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place?.formatted_address) {
            // Create a comprehensive location string
            let locationString = '';
            
            // Check if this place has a business name
            if (place.name && place.name !== place.formatted_address) {
              // Check if it's a business/establishment type
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
              
              if (isBusinessType) {
                locationString = `${place.name}, ${place.formatted_address}`;
              } else {
                locationString = place.formatted_address;
              }
            } else {
              locationString = place.formatted_address;
            }
            
            setInputText(locationString);
            onchange && onchange(locationString);
            console.log("Selected location:", {
              name: place.name,
              address: place.formatted_address,
              types: place.types,
              business_status: place.business_status,
              final_string: locationString
            });
          }
        });
      }
    });

    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [apiKey, onchange]);

  // Update inputText when initialValue changes (for edit mode)
  useEffect(() => {
    if (initialValue && initialValue !== inputText) {
      setInputText(initialValue);
    }
  }, [initialValue]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div className="relative">
      <input
        id={id}
        ref={inputRef}
        type="text"
        name="location"
        value={inputText}
        onChange={handleInputChange}
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}
