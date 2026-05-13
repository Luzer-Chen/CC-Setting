mod commands;
mod paths;
mod backup;
mod writer;

fn main() {
    let mut builder = tauri::Builder::default();

    #[cfg(not(target_os = "ios"))]
    {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }

    builder
        .invoke_handler(tauri::generate_handler![
            commands::resolve_target_path,
            commands::read_settings_file,
            commands::backup_settings_file,
            commands::write_settings_file,
            commands::restore_latest_backup,
            commands::export_json_file,
            commands::choose_project_directory,
            commands::open_folder,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
