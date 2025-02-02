# A simple tauri app for athan alerts for windows systems

Uses tauri + svelte.

## How to get started

Just follow the tauri-v2 quick start tutorial, then npm i in this repo.

## What is it

While working as a developer, I realized that I would often miss my prayers when working on a project as I would hyperfixate. To help with that, and learn some tauri, I decided to make a free and open source desktop app that runs in the background and gives alerts about namaz timings of the region, which is fetched by accessing the machine's location (not IP address). It runs entirely locally, only using the location in a request to a free api to get your local areas athan timings. Currently works only on windows. Will test it out for MAC too.