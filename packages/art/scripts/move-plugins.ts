import fs from 'fs';
import path from 'path';
import os from 'os';
import glob from 'glob';

const findTiledPluginDir = (): string | null => {
  const homeDir = os.homedir();
  const possiblePaths = [
    path.join(homeDir, '.config', 'Tiled', 'extensions'),
    path.join(homeDir, 'Library', 'Preferences', 'Tiled', 'extensions'), // macOS
    path.join(homeDir, 'AppData', 'Roaming', 'Tiled', 'extensions'), // Windows
  ];

  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      return possiblePath;
    }
  }

  return null;
};

const movePlugins = () => {
  const pluginDir = findTiledPluginDir();
  if (!pluginDir) {
    console.error('Could not find Tiled plugin directory.');
    process.exit(1);
  }

  const extensionFiles = glob.sync(path.join(__dirname, '..', 'tiled', 'extensions', '*.js'));
  if (extensionFiles.length === 0) {
    console.log('No .js files found in the tiled/extensions directory.');
    return;
  }

  for (const file of extensionFiles) {
    const fileName = path.basename(file);
    const destPath = path.join(pluginDir, fileName);
    fs.copyFileSync(file, destPath);
    console.log(`Moved ${fileName} to ${pluginDir}`);
  }
};

movePlugins();
