import { sendNotification } from "@tauri-apps/plugin-notification";
import { fetch } from "@tauri-apps/plugin-http";
// FetchLocation.ts

export let prayerTimes: PrayerTimes | null = null;
export let nextPrayer: string = "";
export let timeUntilNextPrayer: string = "";
let updateInterval: ReturnType<typeof setInterval>;

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export async function fetchPrayerTimes(longitude: number, latitude: number) {
    if (latitude === null || longitude === null) {
      console.error("Latitude and longitude are not provided.");
      return;
    }
  
    try {
      const response = await fetch(
        "http://api.aladhan.com/v1/timings?" +
          new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            method: "2", // Change method if required
          }).toString()
      );
  
      if (response.ok) {
        const data = await response.json();
        prayerTimes = data.data.timings;
        console.log("Fetched Prayer Times:", prayerTimes);
        updateNextPrayer();
      } else {
        console.error("Error fetching prayer times:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Exception while fetching prayer times:", error);
    }
  }
  

  function updateNextPrayer() {
    if (!prayerTimes) {
      console.error("Prayer times not available.");
      return;
    }
  
    const now = new Date();
    const prayers = [
      { name: "Fajr", time: prayerTimes.Fajr },
      { name: "Dhuhr", time: prayerTimes.Dhuhr },
      { name: "Asr", time: prayerTimes.Asr },
      { name: "Maghrib", time: prayerTimes.Maghrib },
      { name: "Isha", time: prayerTimes.Isha },
    ];
  
    const prayerDates = prayers.map((prayer) => {
      const [hours, minutes] = prayer.time.split(":").map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);
  
      // Handle cases where the prayer time is before current time
      if (prayerDate < now) {
        prayerDate.setDate(prayerDate.getDate() + 1); // Move to next day
      }
  
      return { name: prayer.name, date: prayerDate };
    });
  
    // Find the next prayer
    const nextPrayerTime = prayerDates.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
  
    nextPrayer = nextPrayerTime.name;
    const timeUntil = nextPrayerTime.date.getTime() - now.getTime();
    const minutes = Math.floor(timeUntil / 1000 / 60);
  
    timeUntilNextPrayer = `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  
    // Notify when the prayer is about to start
    if (minutes <= 1) {
      sendNotification({
        title: "Prayer Time",
        body: `It's time for ${nextPrayerTime.name} prayer`,
      });
    }
  }
  
