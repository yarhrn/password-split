---
title: 'How it works: Password Split Protocol'
description: 'Understanding the cryptographic architecture and security decisions behind our password splitting system'
publishDate: 2024-12-13
author: 'Password Split Team'
tags: ['cryptography', 'security', 'shamir', 'protocol']
---

# How it works: Password Split Protocol

Password Split uses a sophisticated cryptographic architecture that combines Shamir's Secret Sharing with modern encryption to securely distribute passwords. This post explains the reasoning behind each step in our protocol and why specific cryptographic choices were made.

## Core Strategy: Encrypt First, Then Split

Our protocol operates in two main phases, but with a crucial insight: we don't split the password directly - we split the encryption key that protects it.

**Why this approach?**

- Passwords often contain patterns and low entropy that make direct splitting vulnerable
- Encryption keys are perfectly random, making them ideal for mathematical splitting
- This allows us to leverage both the security of modern encryption and the mathematical guarantees of secret sharing

## Splitting Process: Step-by-Step Reasoning

### 1. Generate a Cryptographically Strong Encryption Key

**What happens:** We create a 256-bit AES key using the browser's secure random number generator

**Why this is done:**

- AES-256 is the gold standard for symmetric encryption, trusted by governments and security experts
- 256-bit keys provide protection against even theoretical quantum computer attacks
- Browser's standardized crypto API uses hardware-based randomness when available, ensuring unpredictable keys
- We rely on the browser's audited cryptographic implementation rather than custom JavaScript code
- A randomly generated key has maximum entropy, making it perfect for mathematical splitting

### 2. Generate a Unique Initialization Vector (IV)

**What happens:** We create a 96-bit random value for each password split

**Why this is done:**

- IVs ensure that the same password encrypted twice produces different ciphertexts
- This prevents attackers from recognizing repeated passwords
- 96 bits provides sufficient uniqueness for billions of operations
- GCM mode specifically requires 96-bit IVs for optimal security

### 3. Encrypt the Original Password

**What happens:** We use AES-256-GCM to encrypt the password with the generated key and IV

**Why AES-GCM specifically:**

- Provides both confidentiality (encryption) and authenticity (tamper detection)
- If anyone modifies the encrypted data, decryption will fail with an error
- GCM mode is fast and secure, widely used in TLS and other security protocols
- Prevents attackers from making undetected changes to the encrypted password

### 4. Split the Encryption Key Using Shamir's Secret Sharing

**What happens:** We mathematically divide the 256-bit key into multiple shares using polynomial interpolation

**Why Shamir's scheme:**

- Provides "perfect secrecy" - having fewer than the threshold shares reveals absolutely nothing
- Based on solid mathematical foundations (polynomial interpolation over finite fields)
- We use an [audited open-source implementation](https://github.com/privy-io/shamir-secret-sharing?tab=readme-ov-file#security-considerations) that has undergone security review
- Allows flexible threshold configurations (e.g., 3 of 5, 2 of 7, etc.)
- Each share is the same size, making distribution symmetric and fair

### 5. Bundle Each Share with Complete Metadata

**What happens:** Each part contains its key share plus all information needed for reconstruction

**Why include everything in each part:**

- Parts can be stored and transmitted independently without coordination
- No single "master" file that becomes a single point of failure
- Users can verify they have compatible parts before attempting reconstruction
- Simplifies the user experience - any threshold number of parts is sufficient

### 6. Encode Everything for Safe Transport

**What happens:** We convert all binary data to Base64 text format

**Why Base64 encoding:**

- Safe for email, text files, and copy-paste operations
- Survives character encoding conversions and line ending changes
- Can be stored in any text-based system (notes apps, documents, etc.)
- Increases size by only 33%, which is acceptable for key shares

## What You Actually Store: The Complete Part Structure

After the splitting process, each user receives a Base64-encoded string that contains a complete JSON structure with these fields:

**Metadata (shared across all parts):**

- **schemeId**: Unique identifier (UUID) that links all parts together
- **description**: Optional user-provided description of what password this is for
- **totalParts**: How many parts were created in total (e.g., 5)
- **threshold**: How many parts are needed to reconstruct (e.g., 3)
- **createdAt**: Timestamp when the split was performed
- **version**: Protocol version number for future compatibility
- **iv**: The initialization vector used for encryption (Base64 encoded)
- **encryptedSecret**: The encrypted password itself (Base64 encoded)
- **encryptionMethod**: Always "AES-GCM" in current implementation

**Part-specific data:**

- **part**: The actual key share for this specific part (Base64 encoded)
- **position**: Which part number this is (1, 2, 3, etc.)

**Why this structure:**

- Everything needed for reconstruction is self-contained in each part
- Users don't need to coordinate or remember additional information
- Metadata helps users verify they have compatible parts before attempting reconstruction
- The encrypted password travels with each part, eliminating single points of failure
- Base64 encoding makes the entire structure safe for text-based storage and transmission

**Important Security Note about Metadata:**
The metadata fields (like threshold, totalParts, description) are primarily for usability and user interface purposes. Tampering with these fields cannot compromise the actual security of password reconstruction because AES-256-GCM provides cryptographic authenticity guarantees.

For example, if an attacker changes the threshold from 3 to 2 in the metadata, it doesn't actually allow reconstruction with fewer shares - the mathematical properties of Shamir's Secret Sharing still require the original threshold number of shares to reconstruct the correct encryption key. If they try to reconstruct with insufficient shares, they'll get a wrong key, and AES-GCM decryption will fail with an authentication error, clearly indicating the attempt was unsuccessful.

The real cryptographic security lies in the mathematical requirements of the secret sharing scheme and the authenticated encryption, not in the metadata values.

## Reconstruction Process: Verification and Recovery

### 1. Validate All Provided Parts

**What happens:** We check that parts are compatible and sufficient for reconstruction

**Why these checks:**

- Prevents user frustration from attempting impossible reconstructions
- Detects corrupted or modified parts early in the process
- Ensures all parts belong to the same original password split
- Validates that the threshold requirement is met

### 2. Mathematically Combine the Key Shares

**What happens:** We use Shamir's reconstruction algorithm to rebuild the original encryption key

**Why this works:**

- Polynomial interpolation guarantees exact reconstruction with threshold shares
- The mathematics ensures that any threshold combination produces the same key
- Extra shares beyond the threshold are simply ignored (redundancy is helpful)
- The process is deterministic - same shares always produce same key

### 3. Attempt to Decrypt the Password

**What happens:** We use the reconstructed key and stored IV to decrypt the original password

**Why decryption might fail:**

- Corrupted or modified shares will produce the wrong key
- Tampered encrypted data will be detected by GCM authentication
- This provides a strong verification that reconstruction succeeded
- Failure clearly indicates data integrity problems

## Security Properties and Why They Matter

### Information Theoretic Security from Shamir's Sharing

- **Property:** Fewer than threshold shares reveal literally zero information about the key
- **Why this matters:** Even with unlimited computing power, an attacker cannot break this protection
- **Real-world benefit:** Safely store parts in multiple locations without worrying about some being compromised

### Authenticated Encryption from AES-GCM

- **Property:** Any modification to encrypted data is detected during decryption
- **Why this matters:** Prevents subtle attacks that modify passwords in undetectable ways
- **Real-world benefit:** You can trust that reconstructed passwords are exactly what was originally split

### Cryptographic Randomness Throughout

- **Property:** All random values (keys, IVs, UUIDs) use secure random number generation
- **Why this matters:** Predictable random values would completely break the security
- **Real-world benefit:** Protection holds even against sophisticated attackers with advanced capabilities

## Design Decisions and Trade-offs

### Why Split Keys Instead of Passwords Directly

- **Decision:** Encrypt password first, then split the encryption key
- **Alternative:** Split the password directly into shares
- **Reasoning:** Passwords have patterns and low entropy that could leak information through direct splitting. Additionally, AES-GCM guarantees authenticity of the deciphered data - if reconstruction produces the wrong key (due to insufficient or corrupted shares), decryption will definitively fail rather than producing garbage data that might be mistaken for a valid password

### Why Include Encrypted Password in Every Part

- **Decision:** Store encrypted password with each key share
- **Alternative:** Split encrypted password separately or store centrally
- **Reasoning:** Eliminates single points of failure and simplifies user experience

### Why Use Browser Crypto APIs and Audited Libraries

- **Decision:** Rely on Web Crypto API for encryption and audited open-source implementation for Shamir's Secret Sharing
- **Alternative:** Implement cryptographic primitives from scratch in JavaScript
- **Reasoning:** Browser crypto implementations are audited, hardware-accelerated, and maintained by security experts. The [Shamir implementation we use](https://github.com/privy-io/shamir-secret-sharing?tab=readme-ov-file#security-considerations) is audited and open-source, allowing independent security verification

### Why Base64 Encoding

- **Decision:** Encode all binary data as Base64 text
- **Alternative:** Use binary formats or other encodings
- **Reasoning:** Maximizes compatibility with text-based systems and human workflows

## Threat Model: What We Protect Against

### Partial Compromise Scenarios

- **Threat:** Attacker gains access to some (but not threshold) shares
- **Protection:** Mathematical guarantee that partial shares reveal nothing
- **Benefit:** Safe to use multiple storage locations without perfect security for each

### Data Tampering Attacks

- **Threat:** Attacker modifies shares or encrypted data
- **Protection:** Authentication in AES-GCM detects any modifications
- **Benefit:** Reconstruction will clearly fail rather than produce wrong passwords

### Storage and Transmission Interception

- **Threat:** Attacker observes parts during storage or transmission
- **Protection:** Each individual part is useless without threshold collection
- **Benefit:** Can safely send parts via insecure channels if needed

## Why This Architecture Matters

The Password Split Protocol combines the mathematical perfection of Shamir's Secret Sharing with the practical security of modern encryption. This dual-layer approach ensures that your passwords are protected by both information-theoretic security (which cannot be broken even with unlimited computing power) and computational security (which leverages the best cryptographic practices used throughout the modern internet).

The result is a system that is both theoretically sound and practically usable, providing strong security guarantees while maintaining a simple user experience.
