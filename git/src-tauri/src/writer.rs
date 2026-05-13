use std::fs;
use std::path::Path;

pub fn read_file(path: &str) -> Result<Option<String>, String> {
    let p = Path::new(path);
    if !p.exists() {
        return Ok(None);
    }
    let content = fs::read_to_string(p)
        .map_err(|e| format!("读取文件失败: {}", e))?;
    Ok(Some(content))
}

pub fn write(path: &str, content: &str) -> Result<(), String> {
    let p = Path::new(path);
    let parent = p.parent().ok_or_else(|| "无法获取父目录".to_string())?;
    fs::create_dir_all(parent)
        .map_err(|e| format!("创建目录失败: {}", e))?;

    serde_json::from_str::<serde_json::Value>(content)
        .map_err(|e| format!("JSON 格式错误: {}", e))?;

    fs::write(p, content)
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(())
}

#[cfg(not(target_os = "ios"))]
pub fn export(content: &str, default_filename: &str) -> Result<String, String> {
    serde_json::from_str::<serde_json::Value>(content)
        .map_err(|e| format!("JSON 格式错误: {}", e))?;

    let path = rfd::FileDialog::new()
        .set_title("导出 JSON 文件")
        .set_file_name(default_filename)
        .add_filter("JSON", &["json"])
        .save_file();

    match path {
        Some(p) => {
            fs::write(&p, content)
                .map_err(|e| format!("写入文件失败: {}", e))?;
            Ok(p.to_string_lossy().to_string())
        }
        None => Err("用户取消了导出".to_string()),
    }
}

#[cfg(target_os = "ios")]
pub fn export(content: &str, default_filename: &str) -> Result<String, String> {
    serde_json::from_str::<serde_json::Value>(content)
        .map_err(|e| format!("JSON 格式错误: {}", e))?;

    let docs = dirs::document_dir()
        .ok_or_else(|| "无法获取文档目录".to_string())?;
    let path = docs.join(default_filename);

    fs::write(&path, content)
        .map_err(|e| format!("写入文件失败: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}
