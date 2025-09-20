import { expect, test } from 'vitest';
import { split, reconstruct, encodePartToBase64, decodePartFromBase64 } from './shamir';
import { isLeft, isRight } from './either';

test('split creates correct number of parts', async () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 3;

  const result = await split(password, threshold, totalParts);

  expect(result.parts).toHaveLength(totalParts);
  expect(result.parts[0].metadata.totalParts).toBe(totalParts);
  expect(result.parts[0].metadata.threshold).toBe(threshold);
  expect(result.parts[0].metadata.encryptionMethod).toBe('AES-GCM');
  expect(result.parts[0].metadata.version).toBe(2);
});

test('split creates unique scheme IDs', async () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 3;

  const result1 = await split(password, threshold, totalParts);
  const result2 = await split(password, threshold, totalParts);

  expect(result1.parts[0].metadata.schemeId).not.toBe(result2.parts[0].metadata.schemeId);
});

test('split includes description in metadata', async () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 3;
  const description = 'Test password for backup';

  const result = await split(password, threshold, totalParts, description);

  expect(result.parts[0].metadata.description).toBe(description);
});

test('reconstruct succeeds with threshold parts', async () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 3;

  const splitResult = await split(password, threshold, totalParts);

  // Use first 2 parts (threshold)
  const partsToReconstruct = splitResult.parts.slice(0, threshold);
  const result = await reconstruct(partsToReconstruct);

  expect(isRight(result)).toBe(true);
  if (isRight(result)) {
    expect(result.value.secret).toBe(password);
    expect(result.value.metadata.schemeId).toBe(splitResult.parts[0].metadata.schemeId);
  }
});

test('reconstruct fails with insufficient parts', async () => {
  const password = 'test-password-123';
  const threshold = 3;
  const totalParts = 5;

  const splitResult = await split(password, threshold, totalParts);

  // Use only 2 parts (less than threshold)
  const partsToReconstruct = splitResult.parts.slice(0, 2);
  const result = await reconstruct(partsToReconstruct);

  expect(isLeft(result)).toBe(true);
  if (isLeft(result)) {
    expect(result.value.error).toContain('Insufficient parts');
  }
});

test('reconstruct fails with no parts', async () => {
  const result = await reconstruct([]);

  expect(isLeft(result)).toBe(true);
  if (isLeft(result)) {
    expect(result.value.error).toContain('No parts provided');
  }
});

test('encode and decode part roundtrip', () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 3;

  split(password, threshold, totalParts).then(splitResult => {
    const originalPart = splitResult.parts[0];
    const encoded = encodePartToBase64(originalPart);
    const decoded = decodePartFromBase64(encoded);

    expect(decoded.metadata.schemeId).toBe(originalPart.metadata.schemeId);
    expect(decoded.part).toBe(originalPart.part);
    expect(decoded.position).toBe(originalPart.position);
  });
});

test('parts have correct positions', async () => {
  const password = 'test-password-123';
  const threshold = 2;
  const totalParts = 5;

  const result = await split(password, threshold, totalParts);

  // Check that positions are 1-indexed and unique
  const positions = result.parts.map(part => part.position);
  expect(positions).toEqual([1, 2, 3, 4, 5]);

  // Check that all parts share the same metadata
  const firstMetadata = result.parts[0].metadata;
  result.parts.forEach(part => {
    expect(part.metadata.schemeId).toBe(firstMetadata.schemeId);
    expect(part.metadata.totalParts).toBe(firstMetadata.totalParts);
    expect(part.metadata.threshold).toBe(firstMetadata.threshold);
  });
});
