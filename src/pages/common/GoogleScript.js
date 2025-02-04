import { useEffect } from "react";
export default function GoogleScript() {
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      // script.src = `https://maps.googleapis.com/maps/api/js?key=${'AIzaSyDzPG91wtUKY3vd_iD3QWorkUCSdofTS58'}&libraries=places`;
      script.async = true;
      script.onload = () => console.log("Google Maps API Loaded");
      document.body.appendChild(script);
    }
  }, []);

  return  <></>;
}
