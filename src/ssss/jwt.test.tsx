import { expect, test } from 'vitest';
import { verifyLicenseKey } from './jwt';
import { isLeft, isRight } from './either';

test('fail in case token is expired', async () => {
  const result = await verifyLicenseKey(validExpiredToken, testingPublicKeyPem);

  expect(isLeft(result)).toBe(true);
  if (isLeft(result)) {
    expect(result.value.error).toBe('EXPIRED');
  }
});

test('succeed in case token', async () => {
  const result = await verifyLicenseKey(validToken, testingPublicKeyPem);

  expect(isRight(result)).toBe(true);
  if (isRight(result)) {
    expect(result.value.expiresAt).toBeInstanceOf(Date);
  }
});

test('fail because token is invalid format', async () => {
  const result = await verifyLicenseKey('test', testingPublicKeyPem);

  expect(isLeft(result)).toBe(true);
  if (isLeft(result)) {
    expect(result.value.error).toBe('VERIFICATION_EXCEPTION');
  }
});

test('fail because signature not valid', async () => {
  const result = await verifyLicenseKey(validExpiredToken.slice(0, -1) + 'A', testingPublicKeyPem);

  expect(isLeft(result)).toBe(true);
  if (isLeft(result)) {
    expect(result.value.error).toBe('SIGNATURE_NOT_VALID');
  }
});

let testingPublicKeyPem = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAm9NJtvGMTIabhodkMvdz
zWpadlrIu1glcNCzu23xdV3gzu3djQ3QiyiPDFcOunwLOng5npyuxSheNEVbcCtL
7Ff+YoYT9KSHWFsxNnHrurIz7/Rjo1inMU1ShIM+uUmgWN8ma033cWRcmTuuuAJr
nmNEuQpSGbMKv3pD0q8q1Y4LUguqcHZ0QHFDAW4wee2JRS8hCoCfqdIfAkN/+/L9
nN55rIzX1lvwu+hi7JfxDKg2+3p3l7vVUE/fEod2FhtJdOijHtMGM3mhqMFFngq9
djX632T6dpOsC5RymGm6VZ8USojU2dhFYpWdvSKVwXR6DTyBXkV4PFT2cK19bdUF
YQIDAQAB
-----END PUBLIC KEY-----
`;

let validExpiredToken = `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwYXNzd29yZHNwbGl0IiwiZXhwIjoxNzU3MzUzMzUzfQ.MLTH3EOztQ-6ylDwzqlp7UjwDCTITr8gF-FCr-9WkYY6Jo7KcgBzyRuzakKzVI2Fjm9QbTcx3VrG4z25Q-cSf_8_2dOristqwi1RmrCLVW_gW9O8QfYh6S_xPOsUc10UWpnb9KCF999RzsOBiRq0SeWn4yS9iRNjZgdWnNPSzMjMW8mzUXU0s_6RuPtkP-i1fsdmH0plZQA3rULy5mmoNWoYzcSmNI4p5YjLkAaGlQqzz9e532BzT_rFFmnaCf6Ydqpt8JyRtjxUPULfER_vND738BsuvTWB6j3pJljXZ57CyHhnCLHtYld9QuADX6l9vO4oPZMphIl9xSgduXP5CQ`;

let validToken = `eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJwYXNzd29yZHNwbGl0IiwiZXhwIjoyNjIxMzUyNzc1fQ.hpUCOzQSv-6PrrpDzp1-QCAeZVhO20cVyKkqikZyGkXEhe0jFPdwBjEzv-sPUVc0FP-r__l3CRZqvudPDTm6y3JCvEQsR5HpbJTT0Z8pbAODzjKWJQmqgSytlyh4qEkmikOPcB1Nr9z4LQBOh_JsfrMFX0XWoHj-4JHVeN5yucv9CR_iWRxtaDyk4vGtSROOqB6Sz9CuxDpwUZ-Zp3CAxppTdIPh-BtQLr1bfVcTaK8aXVijQoqHWzZn6HOwp48Vd0C4S7kC4RwRJBSuaybMOTA_bPoeZd212O9LUBFgXC197BDxkQrxSmgLL_R_dYaz8iZ4NnGCSNqY0dotIcCogg`;
