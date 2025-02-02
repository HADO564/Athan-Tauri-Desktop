export async function requestNotificationPermission() {
    try {
      await Notification.requestPermission();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }