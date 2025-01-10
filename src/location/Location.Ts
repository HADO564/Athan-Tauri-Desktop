import { Command } from "@tauri-apps/plugin-shell";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coords: Coordinates;
  city?: string;
  country?: string;
}

/**
 * Fetch the user's current coordinates using the shell command (Windows compatible).
 * Falls back to the Geolocation API if shell fails.
 * @returns {Promise<Coordinates | null>} The coordinates or null if an error occurs.
 */
export async function requestLocation(): Promise<Coordinates | null> {
  try {
    // Use shell command to get location data via ipinfo.io
    const command = Command.create("curl", ["https://ipinfo.io/json"]);
    const output = await command.execute();

    if (output.code === 0 && output.stdout) {
      // Parse the JSON response from ipinfo.io
      const data = JSON.parse(output.stdout);
      const [latitude, longitude] = data.loc.split(","); // `loc` field contains "lat,long"

      return {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };
    } else {
      console.error("Shell command failed:", output.stderr || "Unknown error");
      return null;
    }
  } catch (shellError) {
    console.warn(
      "Shell command failed, falling back to Geolocation API.",
      shellError
    );

    // Fallback: Geolocation API
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          (error) => {
            console.error(
              "Error getting location via Geolocation API:",
              error.message
            );
            reject(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        console.error("Geolocation API is not available in this environment.");
        reject(null);
      }
    });
  }
}

/**
 * Fetch the city and country based on latitude and longitude using the Nominatim API.
 * @param {number} latitude - The latitude of the location.
 * @param {number} longitude - The longitude of the location.
 * @returns {Promise<Location | null>} The location with city and country, or null if an error occurs.
 */
export async function getCityAndCountry(
  latitude: number,
  longitude: number
): Promise<Location | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );

    if (response.ok) {
      const data = await response.json();
      const city =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.hamlet;
      const country = data.address.country;

      return { coords: { latitude, longitude }, city, country };
    } else {
      console.error("Error fetching city and country:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching city and country:", error);
    return null;
  }
}

/**
 * Get the user's location along with the city and country.
 * @returns {Promise<Location | null>} The location object or null if an error occurs.
 */
export async function getLocationWithDetails(): Promise<Location | null> {
  try {
    const coords = await requestLocation();
    if (!coords) return null;

    return await getCityAndCountry(coords.latitude, coords.longitude);
  } catch (error) {
    console.error("Failed to get location details:", error);
    return null;
  }
}
