// Tray.ts
import { Window } from "@tauri-apps/api/window";
import { readFile } from "@tauri-apps/plugin-fs";
import { defaultWindowIcon } from "@tauri-apps/api/app";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";
import { type Image } from "@tauri-apps/api/image";

let tray: TrayIcon | null = null;
export async function createTrayIcon() {
  if (tray) {
    console.log("Tray icon already exists."); // Prevent duplicate tray creation
    return tray;
  }
  const mainWindow = Window.getCurrent();
  // Create menu items with handlers
  const menu = await Menu.new({
    items: [
      {
        id: "show",
        text: "Show",
        action: async () => {
          const window = Window.getCurrent();
          await window.show();
          await window.setFocus();
        },
      },
      {
        id: "hide",
        text: "Hide",
        action: async () => {
          const window = Window.getCurrent();
          await window.hide();
        },
      },
      {
        id: "quit",
        text: "Quit",
        action: async () => {
          await mainWindow.destroy();
        },
      },
    ],
  });
  try {
    const icon = await defaultWindowIcon();
  } catch (error) {
    console.error("Failed to load tray icon:", error);
  }
  tray = await TrayIcon.new({
    icon: "icons/icon.ico", // Pass the icon data in Uint8Array format
    menu,
    tooltip: "Athan",
    title: "Athan",
    menuOnLeftClick: true,
  });
  // Set up window close handler
  await mainWindow.onCloseRequested(async (event) => {
    event.preventDefault(); // Prevent the window from closing
    await mainWindow.hide(); // Hide the window instead
  });
  return tray;
}
