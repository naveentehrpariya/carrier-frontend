import React, { useEffect, useRef, useState } from "react";
import { MdOutlineMyLocation } from "react-icons/md";

export default function GetLocation({index, onchange, placeholder}) {

  const googlemap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const inputRef = useRef(null);
  const [inputText, setInput] = useState(null);

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
        autocompleteInstance.addListener("place_changed", handlePlaceSelect);
      }
    };

    const handlePlaceSelect = () => {
      if (autocompleteInstance) {
        const place = autocompleteInstance.getPlace();
        if (inputRef && inputRef.current && place?.formatted_address) {
          onchange && onchange(index, place.formatted_address);
          console.log("place.formatted_address",place.formatted_address)
          setInput(place.formatted_address || inputText);
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
    setInput(e.target.value)
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text" name="location"
        value={inputText  || ""}
        onChange={handleInput}  
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}