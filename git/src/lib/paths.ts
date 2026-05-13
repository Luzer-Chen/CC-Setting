import { invoke } from '@tauri-apps/api/core';
import { TargetType } from './types';

export async function resolveTargetPath(targetType: TargetType, projectDir: string | null): Promise<string> {
  return invoke<string>('resolve_target_path', {
    targetType,
    projectDir,
  });
}

export async function writeSettingsFile(path: string, content: string): Promise<void> {
  return invoke<void>('write_settings_file', { path, content });
}

export async function exportJsonFile(content: string, defaultFilename: string): Promise<string> {
  return invoke<string>('export_json_file', { content, defaultFilename });
}

export async function chooseProjectDirectory(): Promise<string | null> {
  return invoke<string | null>('choose_project_directory');
}

export async function openFolder(path: string): Promise<void> {
  return invoke<void>('open_folder', { path });
}
