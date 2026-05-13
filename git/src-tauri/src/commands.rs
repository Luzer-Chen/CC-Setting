use crate::paths;
use crate::backup;
use crate::writer;

#[tauri::command]
pub fn resolve_target_path(target_type: String, project_dir: Option<String>) -> Result<String, String> {
    paths::resolve(&target_type, project_dir.as_deref())
}

#[tauri::command]
pub fn read_settings_file(path: String) -> Result<Option<String>, String> {
    writer::read_file(&path)
}

#[tauri::command]
pub fn backup_settings_file(path: String) -> Result<String, String> {
    backup::backup(&path)
}

#[tauri::command]
pub fn write_settings_file(path: String, content: String) -> Result<(), String> {
    writer::write(&path, &content)
}

#[tauri::command]
pub fn restore_latest_backup(path: String) -> Result<String, String> {
    backup::restore(&path)
}

#[tauri::command]
pub fn export_json_file(content: String, default_filename: String) -> Result<String, String> {
    writer::export(&content, &default_filename)
}

#[tauri::command]
pub fn choose_project_directory() -> Result<Option<String>, String> {
    paths::choose_directory()
}

#[tauri::command]
pub fn open_folder(path: String) -> Result<(), String> {
    #[cfg(not(target_os = "ios"))]
    {
        let path_buf = std::path::PathBuf::from(&path);
        if !path_buf.exists() {
            return Err(format!("Folder does not exist: {}", path));
        }

        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("explorer")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("xdg-open")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }
    }

    #[cfg(target_os = "ios")]
    {
        let _ = path;
    }

    Ok(())
}
