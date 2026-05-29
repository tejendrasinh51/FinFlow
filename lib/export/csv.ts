import * as csv from 'fast-csv';
import { Writable } from 'stream';

/**
 * High-performance CSV generator that serializes an array of records to a Buffer stream.
 */
export function generateCsv(data: Record<string, any>[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (!data || data.length === 0) {
      return resolve(Buffer.from('No metrics matching filters found in current organization.\n'));
    }

    const chunks: Buffer[] = [];
    
    // Setup a writable capture stream
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      }
    });

    writableStream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    writableStream.on('error', (err) => {
      reject(err);
    });

    // Write fast-csv headers and rows
    const csvStream = csv.format({ headers: true });
    csvStream.pipe(writableStream);
    
    data.forEach((row) => {
      // Flatten simple object properties if any nested configs exist
      const flatRow: Record<string, any> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value && typeof value === 'object' && !(value instanceof Date)) {
          flatRow[key] = JSON.stringify(value);
        } else {
          flatRow[key] = value;
        }
      }
      csvStream.write(flatRow);
    });
    
    csvStream.end();
  });
}
