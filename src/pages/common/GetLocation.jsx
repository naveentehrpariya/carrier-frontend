import React, { useEffect, useRef, useState } from "react";

export default function GetLocation({ index, onchange, placeholder }) {
  const googlemap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef(null);
  const [inputText, setInput] = useState(""); // Initialize with an empty string
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false); // Track if a suggestion was selected

  useEffect(() => {
    let autocompleteInstance;
    const loadScript = () => {
      if (!document.querySelector("#google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${'AIzaSyDzPG91wtUKY3vd_iD3QWorkUCSdofTS58'}&libraries=places`;
        script.async = true;
        script.onload = initializeAutocomplete;
        document.body.appendChild(script);
      } else if (window.google) {
        initializeAutocomplete();
      }
    };

    const initializeAutocomplete = () => {
      if (inputRef.current && window.google) {
        autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current);
        autocompleteInstance.setFields(["formatted_address"]); // Load only address info
        autocompleteInstance.addListener("place_changed", handlePlaceSelect);
      }
    };

    const handlePlaceSelect = () => {
      if (autocompleteInstance) {
        const place = autocompleteInstance.getPlace();
        if (place?.formatted_address) {
          setInput(place.formatted_address); // Set the input value to the selected address
          setIsSuggestionSelected(true); // Flag that a suggestion was selected
          onchange && onchange(index, place.formatted_address); // Pass the selected address back to parent component
          console.log("place.formatted_address", place.formatted_address);
        }
      }
    };

    loadScript();

    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [googlemap]);

  const handleInput = (e) => {
    setInput(e.target.value); // Update input value when typing
    setIsSuggestionSelected(false); // Reset suggestion selection flag
  };

  const handleBlur = () => {
    // When the input loses focus, update the address if no suggestion was selected
    if (!isSuggestionSelected) {
      onchange && onchange(index, inputText); // Update address with the entered value
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={inputText}
        onChange={handleInput}
        onBlur={handleBlur} // Ensure address is updated when input loses focus
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}
