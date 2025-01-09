// Tray.ts
import { Window } from "@tauri-apps/api/window";
import { TrayIcon } from "@tauri-apps/api/tray";
import { Menu } from "@tauri-apps/api/menu";

export async function createTrayIcon() {
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

  // Create tray icon
  const tray = await TrayIcon.new({
    icon: "icons/32x32.png",  // Make sure this path is relative to your resource directory
    menu,
    tooltip: "Athan",
    title: "Athan",
    menuOnLeftClick: true,
  });

  // Set up window close handler
  await mainWindow.onCloseRequested(async (event) => {
    event.preventDefault();  // Prevent the window from closing
    await mainWindow.hide(); // Hide the window instead
  });

  return tray;
}

