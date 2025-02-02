<script lang="ts">
  import { onMount } from "svelte";
  import { createTrayIcon } from "../tray/Tray";
  import { requestPermissionAndLocation } from "../hooks/FetchLocation";
  import {
    fetchPrayerTimes,
    prayerTimes,
    nextPrayer,
    timeUntilNextPrayer,
  } from "../hooks/FetchPrayerTimes";
  import { requestNotificationPermission } from "../hooks/RequestPermission";

  onMount(async () => {
  createTrayIcon();
  await requestNotificationPermission();
  const loc = await requestPermissionAndLocation();
  
  if (loc && loc.latitude !== null && loc.longitude !== null) {
    await fetchPrayerTimes(loc.longitude, loc.latitude);
  } else {
    console.error("Failed to fetch prayer times due to missing location data.");
  }
});
</script>

<main class="container">
  <h1 class="text-3xl bg-blue-200 p-2 rounded-md font-bold">Prayer Times</h1>

  {#if prayerTimes}
    <div class="text-center container">
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

<style lang="postcss">
  .container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  h1 {
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 2rem;
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
