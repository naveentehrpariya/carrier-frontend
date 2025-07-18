// googleMapsLoader.js
let googleMapsScriptLoadingPromise;

export const loadGoogleMapsScript = (apiKey) => {
  if (!googleMapsScriptLoadingPromise) {
    googleMapsScriptLoadingPromise = new Promise((resolve, reject) => {
      if (window.google && window.google.maps) {
        resolve(window.google);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        resolve(window.google);
      };
      script.onerror = reject;

      document.body.appendChild(script);
    });
  }
  return googleMapsScriptLoadingPromise;
};
