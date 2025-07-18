import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript } from "../utils/googleMapsLoader"; // adjust path as needed

export default function GetDeliveryLocation({ onchange, placeholder }) {
  const apiKey = 'AIzaSyARl049FrKlkbob8QImlI5LAa8QmzReNBw';
  const deliveryRef = useRef(null);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    let autocompleteInstance;

    loadGoogleMapsScript(apiKey).then(() => {
      if (deliveryRef.current) {
        autocompleteInstance = new window.google.maps.places.Autocomplete(deliveryRef.current);
        autocompleteInstance.setFields(["formatted_address"]);

        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace();
          if (place?.formatted_address) {
            setInputText(place.formatted_address);
            onchange && onchange(place.formatted_address);
            console.log("Selected address:", place.formatted_address);
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

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  return (
    <div className="relative">
      <input
        id="deliverylocationinput"
        ref={deliveryRef}
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
