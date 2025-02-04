import React, { useEffect, useRef, useState } from "react";

export default function GetLocation({ index, onChange, placeholder }) {
  const googlemap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputDelivery = useRef(null);
  const [inputText, setInput] = useState(""); // Initialize with an empty string
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false); // Track if a suggestion was selected
  const autocompleteRef = useRef(null); // Store autocomplete instance separately

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        // script.src = `https://maps.googleapis.com/maps/api/js?key=${'AIzaSyDzPG91wtUKY3vd_iD3QWorkUCSdofTS58'}&libraries=places`;
        script.async = true;
        script.onload = initializeAutocomplete;
        document.body.appendChild(script);
      } else {
        initializeAutocomplete();
      }
    };

    const initializeAutocomplete = () => {
      if (inputDelivery.current && window.google) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputDelivery.current);
        autocompleteRef.current.setFields(["formatted_address"]); // Load only address info
        autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
      }
    };

    const handlePlaceSelect = () => {
      if (autocompleteRef.current) {
        const place = autocompleteRef.current.getPlace();
        if (place?.formatted_address) {
          setInput(place.formatted_address);
          setIsSuggestionSelected(true);
          onChange && onChange(index, place.formatted_address);
        }
      }
    };

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [googlemap, index, onChange]); // Ensures script is loaded once, prevents unnecessary re-renders

  const handleInput = (e) => {
    setInput(e.target.value);
    setIsSuggestionSelected(false);
  };

  const handleBlur = () => {
    if (!isSuggestionSelected && onChange) {
      onChange(index, inputText);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputDelivery}
        type="text"
        name="location"
        value={inputText}
        onChange={handleInput}
        onBlur={handleBlur}
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}
