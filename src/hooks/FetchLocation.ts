import { invoke } from "@tauri-apps/api/core";

// LocationData.ts
export let latitude: number | null = null;
export let longitude: number | null = null;

async function location() {
  try {
    const loc = await invoke<{ latitude: number; longitude: number }>(
      "get_device_location"
    );
    latitude = loc.latitude;
    longitude = loc.longitude;
    return {longitude,latitude};
  } catch (error) {
    console.error("Error getting location:", error);
  }
}

export async function requestPermissionAndLocation() {
    try {
      const permission = await invoke("request_location_permission");
      console.log("Permission status:", permission);
      if (permission === "Allowed") {
        const loc = await location();
        if (loc) {
          const { longitude, latitude } = loc;
          return { longitude, latitude };
        }
      }
      throw new Error("Permission not granted or location unavailable.");
    } catch (error) {
      console.error("Error requesting location permission:", error);
      return { longitude: null, latitude: null };
    }
  }
  
