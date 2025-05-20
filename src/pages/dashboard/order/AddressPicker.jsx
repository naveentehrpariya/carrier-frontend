import React, { useEffect, useRef } from "react";
import { MdOutlineMyLocation } from "react-icons/md";

function LocationSearch({ name, formData, setFormData }) {
  const googlemap = 'AIzaSyARl049FrKlkbob8QImlI5LAa8QmzReNBw';
  const inputRef = useRef(null);

  useEffect(() => {
    let autocompleteInstance;

    const loadScript = () => {
      if (!document.querySelector("#google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googlemap}&libraries=places`;
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

        // Add listener for place selection
        autocompleteInstance.addListener("place_changed", handlePlaceSelect);
      }
    };

    const handlePlaceSelect = () => {
      if (autocompleteInstance) {
        const place = autocompleteInstance.getPlace();
        if (place?.formatted_address) {
          setFormData((prevData) => ({
            ...prevData,
            [name]: place.formatted_address,
          }));
        }
      }
    };

    loadScript();

    // Cleanup on unmount
    return () => {
      if (autocompleteInstance) {
        window.google.maps.event.clearInstanceListeners(autocompleteInstance);
      }
    };
  }, [googlemap, name, setFormData]);

  const handleInput = (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlemap}`
          )
            .then((response) => response.json())
            .then((data) => {
              const address = data.results[0]?.formatted_address;
              if (address) {
                setFormData((prevData) => ({
                  ...prevData,
                  [name]: address,
                }));
              }
            })
            .catch((error) => console.error("Error with geocoding:", error));
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };




  
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={formData[name] || ""}
        onChange={handleInput}
        className="w-full h-11 lg:h-[48px] appearance-none block bg-white text-[#000] text-base border border-black border-opacity-10 rounded-md lg:rounded-xl py-2 px-4 pr-12 leading-tight focus:outline-none bg-no-repeat "
        placeholder={Enter ${name} location}
      />
      <button
        type="button"
        onClick={detectCurrentLocation}
        className="absolute top-[13px] right-4 rounded-full hover:bg-gray-600"
        title="Detect Current Location"
      >
        <MdOutlineMyLocation size={22} color={"#646567"} />
      </button>
    </div>
  );
}

export default LocationSearch;