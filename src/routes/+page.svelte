<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { sendNotification } from '@tauri-apps/plugin-notification';
  import { fetch } from '@tauri-apps/plugin-http';
  import { createTrayIcon } from '../tray/Tray';
  import {TrayIcon} from "@tauri-apps/api/tray";

  interface PrayerTimes {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  }
  
  let prayerTimes: PrayerTimes | null = null;
  let nextPrayer: string = '';
  let timeUntilNextPrayer: string = '';
  let updateInterval: ReturnType<typeof setInterval>;

  async function requestNotificationPermission() {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  async function fetchPrayerTimes() {
    try {
      // Using Tauri's fetch API
      const response = await fetch(
        'http://api.aladhan.com/v1/timingsByCity?' + 
        new URLSearchParams({
          city: 'Peshawar', // You can change this to your city
          country: 'Pakistan',  // And your country
          method: '2'     // ISNA calculation method
        }).toString() // *** CHANGE LOCATION HERE ***
      );

      if (response.ok) {
        const data = await response.json();
        prayerTimes = data.data.timings;
        updateNextPrayer();
      }
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  }

  function updateNextPrayer() {
  if (!prayerTimes) return;

  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.Fajr },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr },
    { name: 'Asr', time: prayerTimes.Asr },
    { name: 'Maghrib', time: prayerTimes.Maghrib },
    { name: 'Isha', time: prayerTimes.Isha },
  ];

  // Convert prayer times to Date objects
  const prayerDates = prayers.map((prayer) => {
    const [hours, minutes] = prayer.time.split(':');
    const prayerDate = new Date();
    prayerDate.setHours(parseInt(hours), parseInt(minutes), 0);
    return { name: prayer.name, date: prayerDate };
  });

  // Find the next prayer
  let nextPrayerTime = prayerDates.find((prayer) => prayer.date > now);

  if (!nextPrayerTime) {
    // If no prayer is found, it means we're past Isha, so the next prayer is Fajr tomorrow
    const [hours, minutes] = prayerTimes.Fajr.split(':');
    const nextFajr = new Date();
    nextFajr.setDate(nextFajr.getDate() + 1); // Move to the next day
    nextFajr.setHours(parseInt(hours), parseInt(minutes), 0);
    nextPrayerTime = { name: 'Fajr', date: nextFajr };
  }

  nextPrayer = nextPrayerTime.name;
  const timeUntil = nextPrayerTime.date.getTime() - now.getTime();
  const minutes = Math.floor(timeUntil / 1000 / 60);

  timeUntilNextPrayer = `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

  // Send notification when prayer time is due
  if (minutes <= 1) {
    sendNotification({
      title: 'Prayer Time',
      body: `It's time for ${nextPrayerTime.name} prayer`,
    });
  }
}

  onMount(async () => {
    createTrayIcon()
    await requestNotificationPermission();
    await fetchPrayerTimes();
    
    // Update times every minute
    updateInterval = setInterval(() => {
      updateNextPrayer();
    }, 60000);
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });
</script>

<main class="container">
  <h1>Prayer Times</h1>
  
  {#if prayerTimes}
    <div class="prayer-info">
      <div class="next-prayer">
        <h2>Next Prayer</h2>
        <p class="prayer-name">{nextPrayer}</p>
        <p class="time-until">Time until: {timeUntilNextPrayer}</p>
      </div>
      
      <div class="prayer-times">
        <div class="prayer-time">
          <span>Fajr</span>
          <span>{prayerTimes.Fajr}</span>
        </div>
        <div class="prayer-time">
          <span>Dhuhr</span>
          <span>{prayerTimes.Dhuhr}</span>
        </div>
        <div class="prayer-time">
          <span>Asr</span>
          <span>{prayerTimes.Asr}</span>
        </div>
        <div class="prayer-time">
          <span>Maghrib</span>
          <span>{prayerTimes.Maghrib}</span>
        </div>
        <div class="prayer-time">
          <span>Isha</span>
          <span>{prayerTimes.Isha}</span>
        </div>
      </div>
    </div>
  {:else}
    <p>Loading prayer times...</p>
  {/if}
</main>

<style>
  .container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    font-family: system-ui, -apple-system, sans-serif;
  }

  h1 {
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 2rem;
  }

  .prayer-info {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .next-prayer {
    background-color: #f0f9ff;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .next-prayer h2 {
    margin: 0;
    color: #0369a1;
  }

  .prayer-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0.5rem 0;
  }

  .time-until {
    color: #4b5563;
    margin: 0;
  }

  .prayer-times {
    display: grid;
    gap: 1rem;
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .prayer-time {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .prayer-time:last-child {
    border-bottom: none;
  }

  .prayer-time span:first-child {
    font-weight: 500;
    color: #1a1a1a;
  }

  .prayer-time span:last-child {
    color: #4b5563;
  }
</style>