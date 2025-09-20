import { left, right, type Either } from './either';

export type LicenseKey = {
  key: string;
  expiresAt: Date;
};

export type LicenseKeyVerificationError = 'EXPIRED' | 'VERIFICATION_EXCEPTION' | 'SIGNATURE_NOT_VALID';

export async function verifyLicenseKey(
  token: string,
  publicKey: string | null
): Promise<Either<{ error: LicenseKeyVerificationError }, LicenseKey>> {
  try {
    let { valid, payload } = await verifyJwtRS512(token, publicKey ?? productionPublicKeyPem);

    if (!valid) {
      return left({
        error: 'SIGNATURE_NOT_VALID',
      });
    }

    // Check if expiration claim is present
    if (!payload.exp) {
      return left({
        error: 'EXPIRED',
      });
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      return left({
        error: 'EXPIRED',
      });
    }

    return right({
      key: token,
      expiresAt: new Date(payload.exp * 1000),
    });
  } catch (e) {
    return left({
      error: 'VERIFICATION_EXCEPTION',
    });
  }
}

/**
 * Decode base64url as defined in RFC 7515 (JWS)
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 ? 4 - (base64.length % 4) : 0;
  const padded = base64 + '='.repeat(pad);
  const raw = atob(padded);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

/**
 * Import an RSA public key from PEM format
 */
async function importRsaPublicKey(pem: string): Promise<CryptoKey> {
  // Clean up PEM string
  const pemBody = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s+/g, '');

  const keyData = base64UrlToUint8Array(pemBody);

  return crypto.subtle.importKey(
    'spki',
    keyData.buffer as ArrayBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-512', // RS512
    },
    false,
    ['verify']
  );
}

/**
 * Verify JWT using RS512
 */
async function verifyJwtRS512(token: string, pemPublicKey: string) {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  const header = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedHeader)));
  const payload = JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(encodedPayload)));
  const signature = base64UrlToUint8Array(encodedSignature);

  if (header.alg !== 'RS512') {
    throw new Error('Invalid algorithm, expected RS512');
  }

  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);

  const publicKey = await importRsaPublicKey(pemPublicKey);
  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, signature.buffer as ArrayBuffer, data);

  return { valid, header, payload };
}

let productionPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArQJ6y+MWzi+4m6UK6SHr
eh+4P9FHVqYrdgbGQSUjm7blN1xcEiKWcDP3qy/6nXles3fv5nEmiELSG0zyxmaO
2ovhsMomNhlcnV80F6+qSNvAqRSe3sNwr7IgLPdXCvdXV3RIgORcqoYXjbsbfM7/
QgvaGhMZRMwYAgZW1NUt+JIrpfRmG1AlGQoUEVM7fnmoMe9okUR4tfNmJ3Q1xGTn
56y9byXhS2Mj1L9ccfYrsSKB5kYw8ACGRjQKfAVEzn53VA8bQD035ZimnpN+6YUD
JdD3WB8uNr8K/579GAOffmD/puqcxlAi1zjiheubYniDPU5OM+w2KCIgnFWb5Alh
EwIDAQAB
-----END PUBLIC KEY-----
`;
