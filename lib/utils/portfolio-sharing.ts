import pako from 'pako';
import { EtfConfig } from '../types';

// We will use standard string manipulation or simple binary extraction if png-chunks fails,
// but we will assume png-chunks-extract works for now.
// Since these might not have types immediately available if the install fails, we will dynamically import or use require if needed,
// but standard ES imports are preferred. We'll use any for now for the chunk manipulators to avoid strict type errors.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import extractChunks from 'png-chunks-extract';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import encodeChunks from 'png-chunks-encode';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import textChunk from 'png-chunk-text';

const CURRENT_VERSION = 1;
const CHUNK_KEYWORD = 'lens-portfolio';

export interface PortfolioPayload {
  version: number;
  data: EtfConfig[];
}

/**
 * Compresses the portfolio configuration into a tightly packed Uint8Array using Deflate.
 */
function compressPortfolio(config: EtfConfig[]): Uint8Array {
  const payload: PortfolioPayload = {
    version: CURRENT_VERSION,
    data: config,
  };

  const jsonString = JSON.stringify(payload);
  return pako.deflate(jsonString);
}

/**
 * Decompresses a deflate Uint8Array back into an EtfConfig array.
 */
function decompressPortfolio(compressedData: Uint8Array): EtfConfig[] {
  try {
    const jsonString = pako.inflate(compressedData, { to: 'string' });
    const payload = JSON.parse(jsonString) as PortfolioPayload;

    // Here we can handle migrations based on payload.version in the future
    if (payload.version > CURRENT_VERSION) {
      console.warn(
        `Payload version ${payload.version} is newer than current version ${CURRENT_VERSION}`
      );
    }

    return payload.data;
  } catch (err) {
    console.error('Failed to decompress portfolio data:', err);
    throw new Error('Invalid or corrupted portfolio data.');
  }
}

/**
 * Creates a .lens Blob from the portfolio configuration.
 */
export function exportPortfolioToLens(config: EtfConfig[]): Blob {
  const compressedData = compressPortfolio(config);
  return new Blob([compressedData as unknown as BlobPart], { type: 'application/octet-stream' });
}

/**
 * Parses a .lens File back into the portfolio configuration.
 */
export async function importPortfolioFromLens(file: File): Promise<EtfConfig[]> {
  const arrayBuffer = await file.arrayBuffer();
  const compressedData = new Uint8Array(arrayBuffer);
  return decompressPortfolio(compressedData);
}

/**
 * Converts a base64 Data URL to a Uint8Array.
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1];
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Injects compressed portfolio data into a PNG data URL, returning a new Blob.
 */
export function exportPortfolioToSmartPNG(config: EtfConfig[], pngDataUrl: string): Blob {
  const compressedData = compressPortfolio(config);

  // We need to encode the compressed binary data as base64 so it can fit in a standard tEXt chunk.
  // Standard tEXt chunks expect latin1 strings, so we convert the uint8array to base64.
  // We could also use zTXt for native compression but pako + base64 is extremely robust.
  const base64Payload = btoa(String.fromCharCode.apply(null, Array.from(compressedData)));

  const pngBuffer = dataUrlToUint8Array(pngDataUrl);
  const chunks = extractChunks(pngBuffer);

  const newChunk = textChunk.encode(CHUNK_KEYWORD, base64Payload);

  // Insert before the IEND chunk (which is always the last chunk)
  chunks.splice(chunks.length - 1, 0, newChunk);

  const outputBuffer = encodeChunks(chunks);
  return new Blob([outputBuffer as unknown as BlobPart], { type: 'image/png' });
}

/**
 * Extracts portfolio data from a Smart PNG File.
 */
export async function importPortfolioFromSmartPNG(file: File): Promise<EtfConfig[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pngBuffer = new Uint8Array(arrayBuffer);

  try {
    const chunks = extractChunks(pngBuffer);
    const textChunks = chunks
      .filter((chunk: { name: string; data: Uint8Array }) => chunk.name === 'tEXt')
      .map((chunk: { name: string; data: Uint8Array }) => textChunk.decode(chunk.data));

    const payloadChunk = textChunks.find(
      (chunk: { keyword: string; text: string }) => chunk.keyword === CHUNK_KEYWORD
    );

    if (!payloadChunk) {
      throw new Error('No portfolio data found in this image.');
    }

    const base64Payload = payloadChunk.text;
    const binaryString = atob(base64Payload);
    const compressedData = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      compressedData[i] = binaryString.charCodeAt(i);
    }

    return decompressPortfolio(compressedData);
  } catch (err) {
    console.error('Failed to parse PNG chunks:', err);
    throw new Error(
      'Failed to extract portfolio from image. The image may have been compressed or stripped by a social network.'
    );
  }
}
