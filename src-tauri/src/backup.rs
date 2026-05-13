use std::fs;
use std::path::{Path, PathBuf};
use chrono::Local;

pub fn backup(path: &str) -> Result<String, String> {
    let src = Path::new(path);
    if !src.exists() {
        return Err("目标文件不存在，无需备份".to_string());
    }

    let parent = src.parent().ok_or_else(|| "无法获取父目录".to_string())?;
    let backup_dir = parent.join("backups");
    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("创建备份目录失败: {}", e))?;

    let stem = src.file_stem().unwrap().to_string_lossy();
    let ext = src.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();
    let timestamp = Local::now().format("%Y-%m-%d-%H%M%S");
    let backup_name = format!("{}.{}{}{}", stem, timestamp, ext, "");
    let backup_path = backup_dir.join(&backup_name);

    fs::copy(src, &backup_path)
        .map_err(|e| format!("备份文件失败: {}", e))?;

    Ok(backup_path.to_string_lossy().to_string())
}

pub fn restore(path: &str) -> Result<String, String> {
    let src = Path::new(path);
    let parent = src.parent().ok_or_else(|| "无法获取父目录".to_string())?;
    let backup_dir = parent.join("backups");

    if !backup_dir.exists() {
        return Err("没有找到备份目录".to_string());
    }

    let mut backups: Vec<PathBuf> = fs::read_dir(&backup_dir)
        .map_err(|e| format!("读取备份目录失败: {}", e))?
        .filter_map(|entry| entry.ok())
        .map(|entry| entry.path())
        .filter(|p| p.is_file())
        .collect();

    backups.sort_by(|a, b| {
        b.metadata().unwrap().modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            .cmp(&a.metadata().unwrap().modified().unwrap_or(std::time::SystemTime::UNIX_EPOCH))
    });

    let latest = backups.first().ok_or_else(|| "没有找到备份文件".to_string())?;
    fs::copy(latest, src)
        .map_err(|e| format!("恢复备份失败: {}", e))?;

    Ok(latest.to_string_lossy().to_string())
}
