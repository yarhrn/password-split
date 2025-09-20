import { split as shamirSplit, combine as shamirCombine } from 'shamir-secret-sharing';
import { left, right, type Either } from './either';

export type SchemeMetadata = {
  schemeId: string; // Unique identifier (UUID or hash)
  description?: string; // Optional description of the password
  totalParts: number; // Total number of parts generated
  threshold: number; // Minimum parts required
  createdAt: string; // ISO timestamp
  version: number; // Format version
  iv: string; // Base64 encoded IV
  encryptedSecret: string; // Base64 encoded encrypted password
  encryptionMethod: 'AES-GCM'; // Encryption algorithm
};

export type Part = {
  metadata: SchemeMetadata;
  part: string;
  position: number;
};

export type SplitResult = {
  parts: Part[];
};

export type ReconstructResult = Either<
  { error: string },
  {
    secret: string;
    metadata: SchemeMetadata;
  }
>;

export async function split(password: string, threshold: number, totalParts: number, description?: string): Promise<SplitResult> {
  const schemeId = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  // Generate AES-GCM key for encryption
  const encryptionKey = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt the password
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password);
  const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, encryptionKey, passwordBytes);

  // Export key as bytes to split
  const keyBytes = new Uint8Array(await crypto.subtle.exportKey('raw', encryptionKey));

  // Split the encryption key (not the password)
  const shares = await shamirSplit(keyBytes, totalParts, threshold);

  // Create metadata with encrypted password and IV
  const metadata: SchemeMetadata = {
    schemeId,
    description,
    totalParts,
    threshold,
    createdAt,
    version: 2,
    iv: btoa(String.fromCharCode(...iv)),
    encryptedSecret: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
    encryptionMethod: 'AES-GCM',
  };

  // Create parts containing key shares
  const parts: Part[] = shares.map((share, index) => ({
    metadata,
    part: btoa(String.fromCharCode(...share)),
    position: index + 1,
  }));

  return { parts };
}

export async function reconstruct(parts: Part[]): Promise<ReconstructResult> {
  if (parts.length === 0) {
    return left({
      error: 'No parts provided',
    });
  }

  const metadata = parts[0].metadata;

  if (parts.length < metadata.threshold) {
    return left({
      error: `Insufficient parts: need ${metadata.threshold}, got ${parts.length}`,
    });
  }

  try {
    // Reconstruct key shares
    const shares = parts.map(part => {
      const shareString = atob(part.part);
      return new Uint8Array(shareString.split('').map(c => c.charCodeAt(0)));
    });

    // Combine shares to get encryption key bytes
    const reconstructedKeyBytesRaw = await shamirCombine(shares);

    // Convert to proper ArrayBuffer for importKey
    const reconstructedKeyBytes = new ArrayBuffer(reconstructedKeyBytesRaw.length);
    const keyView = new Uint8Array(reconstructedKeyBytes);
    keyView.set(reconstructedKeyBytesRaw);

    // Import the key for decryption
    const encryptionKey = await crypto.subtle.importKey('raw', reconstructedKeyBytes, 'AES-GCM', false, ['decrypt']);

    // Get IV and encrypted data from metadata
    const iv = new Uint8Array(
      atob(metadata.iv)
        .split('')
        .map(c => c.charCodeAt(0))
    );
    const encryptedDataBytes = atob(metadata.encryptedSecret);
    const encryptedData = new ArrayBuffer(encryptedDataBytes.length);
    const encryptedView = new Uint8Array(encryptedData);
    for (let i = 0; i < encryptedDataBytes.length; i++) {
      encryptedView[i] = encryptedDataBytes.charCodeAt(i);
    }

    // Decrypt the password
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, encryptionKey, encryptedData);

    // Convert back to string
    const decoder = new TextDecoder();
    const secret = decoder.decode(decryptedData);

    return right({
      secret,
      metadata,
    });
  } catch (error) {
    return left({
      error: `Failed to reconstruct password: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
}

export function encodePartToBase64(part: Part): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(JSON.stringify(part));
  return btoa(String.fromCharCode(...bytes));
}

export function decodePartFromBase64(base64String: string): Part {
  const decoder = new TextDecoder();
  const bytes = new Uint8Array(
    atob(base64String)
      .split('')
      .map(c => c.charCodeAt(0))
  );
  return JSON.parse(decoder.decode(bytes));
}
