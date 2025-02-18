// import axios from "axios";
// import React, { useEffect, useRef, useState } from "react";

// export default function GetLocation({ index, onchange, placeholder }) {
//   const googlemap = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
//   const inputRef = useRef(null);
//   const [inputText, setInput] = useState(""); // Initialize with an empty string
//   const [isSuggestionSelected, setIsSuggestionSelected] = useState(false); // Track if a suggestion was selected

//   const [suggestions, setSuggestions] = useState([]);
//   const getSuggestions = (place) => { 
//     const resp = axios.get(`https://photon.komoot.io/api/?q=${place}`);
//     resp.then((re)=>{
//       console.log("res",re.data.features);
//       setSuggestions(re.data.features || []);
//     }).catch((err)=>{
//       console.log("err",err)
//     })
//   }

//   const handleInput = (e) => {
//     setInput(e.target.value);
//     setIsSuggestionSelected(false);
//     onchange && onchange(index, inputText);
//     getSuggestions(e.target.value);
//   };

//   // const handleBlur = () => {
//   //   // When the input loses focus, update the address if no suggestion was selected
//   // };
//   const selectAddress = (e) => { 
//     onchange && onchange(index, e);
//     setSuggestions(null);
//   }

//   return (
//     <div className="relative">
//       <input
//         ref={inputRef}
//         type="text"
//         name="location"
//         value={inputText}
//         onChange={handleInput}
//         // onBlur={handleBlur}
//         className="input-sm"
//         placeholder={placeholder || "Search Location"}
//       />
//       {suggestions ? <div className="suggestions_lists bg-white p-2 rounded-xl">
//           {suggestions && suggestions.map((s,i)=>{
//             const place = s.properties || null;
//             return <>
//               <div  onClick={()=>selectAddress(`${place?.name} ${place?.locality} ${place?.street} ${place?.locality} ${place?.state} ${place?.postcode}`)} className="px-2 py-2 rounded-xl bg-gray-200 text-sm my-1 cursor-pointer">{place?.name} {place?.locality} {place?.street} {place?.locality} {place?.state} {place?.postcode}</div>
//             </>
//           })}
//       </div> : ''}
//     </div>
//   );
// }





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
        // script.src = `https://maps.googleapis.com/maps/api/js?key=${'AIzaSyDzPG91wtUKY3vd_iD3QWorkUCSdofTS58'}&libraries=places`;
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
    setInput(e.target.value);
    setIsSuggestionSelected(false);
    if (!isSuggestionSelected) {
      onchange && onchange(index, inputText);
    }
  };

  // const handleBlur = () => {
  //   // When the input loses focus, update the address if no suggestion was selected
  // };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name="location"
        value={inputText}
        onChange={handleInput}
        // onBlur={handleBlur}
        className="input-sm"
        placeholder={placeholder || "Search Location"}
      />
    </div>
  );
}
