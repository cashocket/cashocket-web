import { useState, useEffect } from "react";

export function useScript(src: string) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Agar script pehle se hai, toh wapas load mat karo
    if (document.querySelector(`script[src="${src}"]`)) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    script.onload = () => setLoaded(true);
    script.onerror = () => console.error(`Failed to load script: ${src}`);

    document.body.appendChild(script);

    // Cleanup (Optional)
    return () => {
      // Usually hum remove nahi karte taaki cached rahe
    };
  }, [src]);

  return loaded;
}