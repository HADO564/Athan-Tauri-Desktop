// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde::Serialize;
use windows::Devices::Geolocation::{Geolocator, PositionAccuracy, GeolocationAccessStatus};

#[derive(Serialize)]
struct Location {
    latitude: f64,
    longitude: f64,
}

#[derive(Serialize, PartialEq)]
enum PermissionStatus {
    Allowed,
    Denied,
    Unspecified,
}

#[tauri::command]
async fn request_location_permission() -> Result<PermissionStatus, String> {
    // Request location access
    let access_status = Geolocator::RequestAccessAsync()
        .map_err(|e| format!("Failed to request access: {:?}", e))?
        .await
        .map_err(|e| format!("Error while requesting access: {:?}", e))?;

    // Map the access status to PermissionStatus enum
    match access_status {
        GeolocationAccessStatus::Allowed => Ok(PermissionStatus::Allowed),
        GeolocationAccessStatus::Denied => Ok(PermissionStatus::Denied),
        GeolocationAccessStatus::Unspecified => Ok(PermissionStatus::Unspecified),
        _ => Err("Unknown access status".to_string()),
    }
}

#[tauri::command]
async fn get_device_location() -> Result<Location, String> {
    // Request permissions first
    let permission = request_location_permission().await?;
    if permission != PermissionStatus::Allowed {
        return Err("Location access denied".to_string());
    }

    // Initialize a Geolocator
    let geolocator = Geolocator::new().map_err(|e| format!("Failed to create Geolocator: {:?}", e))?;

    // Set accuracy to high
    geolocator
        .SetDesiredAccuracy(PositionAccuracy::High)
        .map_err(|e| format!("Failed to set accuracy: {:?}", e))?;

    // Get the current position asynchronously
    let geoposition = geolocator
        .GetGeopositionAsync()
        .map_err(|e| format!("Failed to get location: {:?}", e))?
        .await
        .map_err(|e| format!("Error while waiting for location: {:?}", e))?;

    // Extract coordinates
    let coord = geoposition
        .Coordinate()
        .map_err(|e| format!("Failed to get coordinates: {:?}", e))?;
    
    // Handle the Point Result to extract Geopoint
    let point = coord.Point().map_err(|e| format!("Failed to get Geopoint: {:?}", e))?;
    let position = point.Position().unwrap(); // This returns a BasicGeoposition struct

    // Extract latitude and longitude
    let latitude = position.Latitude;
    let longitude = position.Longitude;

    Ok(Location { latitude, longitude })
}
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![get_device_location, request_location_permission])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
