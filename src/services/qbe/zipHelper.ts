import yauzl from 'yauzl';

export interface ZipEntryItem {
  fileName: string;
  uncompressedSize: number;
}

export function listZipEntries(filePath: string): Promise<ZipEntryItem[]> {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true, autoClose: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return resolve([]);

      const entries: ZipEntryItem[] = [];
      zipfile.readEntry();

      zipfile.on('entry', (entry: yauzl.Entry) => {
        entries.push({
          fileName: entry.fileName,
          uncompressedSize: entry.uncompressedSize,
        });
        zipfile.readEntry();
      });

      zipfile.on('end', () => resolve(entries));
      zipfile.on('error', reject);
    });
  });
}

export function readZipEntryAsBuffer(filePath: string, targetEntryName: string): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    yauzl.open(filePath, { lazyEntries: true, autoClose: true }, (err, zipfile) => {
      if (err) return reject(err);
      if (!zipfile) return resolve(null);

      zipfile.readEntry();

      zipfile.on('entry', (entry: yauzl.Entry) => {
        const normalizedName = entry.fileName.replace(/\\/g, '/');
        if (normalizedName === targetEntryName) {
          zipfile.openReadStream(entry, (streamErr, stream) => {
            if (streamErr) return reject(streamErr);
            const chunks: Buffer[] = [];
            stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
          });
        } else {
          zipfile.readEntry();
        }
      });

      zipfile.on('end', () => resolve(null));
      zipfile.on('error', reject);
    });
  });
}

export async function readZipEntryAsText(filePath: string, targetEntryName: string): Promise<string | null> {
  const buf = await readZipEntryAsBuffer(filePath, targetEntryName);
  return buf ? buf.toString('utf8') : null;
}
