import React, { useEffect, useRef, useState } from "react";
export default function GetLocation({ index, onchange, placeholder }) {
  const googlemap = 'AIzaSyARl049FrKlkbob8QImlI5LAa8QmzReNBw';
  const inputRef = useRef(null);
  const [inputText, setInput] = useState(""); 
  const [isSuggestionSelected, setIsSuggestionSelected] = useState(false); // Track if a suggestion was selected

  useEffect(() => {
    let autocompleteInstance;
    const loadScript = () => {
      if (!document.querySelector("#google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
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
          onchange && onchange(place.formatted_address); // Pass the selected address back to parent component
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
    setInput(e.target.value);
    setIsSuggestionSelected(false);
    if (!isSuggestionSelected) {
      setTimeout(() => {
        onchange && onchange(inputText);
      }, 100)
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
        onBlur={handleInput}
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}
