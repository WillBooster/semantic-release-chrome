import { createWriteStream } from 'fs';
import { resolve } from 'path';

import SemanticReleaseError from '@semantic-release/error';
import archiver from 'archiver';
import { readJsonSync, writeJsonSync } from 'fs-extra';

import Context, { Logger } from './@types/context';
import PluginConfig from './@types/pluginConfig';

function prepareManifest(manifestPath: string, version: string, logger: Logger): void {
  const manifest = readJsonSync(manifestPath);

  writeJsonSync(manifestPath, { ...manifest, version }, { spaces: 2 });

  logger.log('Wrote version %s to %s', version, manifestPath);
}

function zipFolder(asset: string, distFolder: string, version: string, logger: Logger): void {
  const zipPath = resolve(asset);
  const output = createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  archive.pipe(output);

  archive.directory(distFolder, false);
  archive.finalize();

  logger.log('Wrote zipped file to %s', zipPath);
}

function prepare({ manifestPath, distFolder, asset }: PluginConfig, { nextRelease, logger }: Context): void {
  if (!asset) {
    throw new SemanticReleaseError(
      "Option 'asset' was not included in the prepare config. Check the README.md for config info.",
      'ENOASSET'
    );
  }

  const version = nextRelease.version;

  const normalizedDistFolder = distFolder || 'dist';

  prepareManifest(manifestPath || `${normalizedDistFolder}/manifest.json`, version, logger);
  zipFolder(asset, normalizedDistFolder, version, logger);
}

export default prepare;
