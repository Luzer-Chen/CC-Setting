use std::path::PathBuf;

pub fn resolve(target_type: &str, project_dir: Option<&str>) -> Result<String, String> {
    let base = match target_type {
        "global" => {
            dirs::home_dir()
                .ok_or_else(|| "无法获取用户主目录".to_string())?
                .join(".claude")
                .join("settings.json")
        }
        "project" => {
            let dir = project_dir.ok_or_else(|| "请先选择项目目录".to_string())?;
            PathBuf::from(dir).join(".claude").join("settings.json")
        }
        "local" => {
            let dir = project_dir.ok_or_else(|| "请先选择项目目录".to_string())?;
            PathBuf::from(dir).join(".claude").join("settings.local.json")
        }
        "template" => {
            let dir = project_dir.ok_or_else(|| "请先选择项目目录".to_string())?;
            PathBuf::from(dir).join(".claude").join("settings.template.json")
        }
        _ => return Err(format!("未知目标类型: {}", target_type)),
    };

    Ok(base.to_string_lossy().to_string())
}

#[cfg(not(target_os = "ios"))]
pub fn choose_directory() -> Result<Option<String>, String> {
    let dir = rfd::FileDialog::new()
        .set_title("选择项目目录")
        .pick_folder();

    Ok(dir.map(|p| p.to_string_lossy().to_string()))
}

#[cfg(target_os = "ios")]
pub fn choose_directory() -> Result<Option<String>, String> {
    Err("iOS 上不支持选择目录".to_string())
}
