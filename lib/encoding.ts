// lib/encoding.ts

/**
 * Base58: A binary-to-text encoding scheme used in cryptocurrencies like Bitcoin.
 * It is similar to Base64 but omits characters that can be mistaken for each other
 * (0, O, I, l) and the '+' and '/' characters to avoid issues with URL parsing and
 * human readability.
 *
 * It is often used to encode cryptographic hashes and addresses, making them shorter
 * and easier to copy and paste.
 *
 * Characters used: "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
 */

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BASE58_MAP = new Map<string, number>();
for (let i = 0; i < BASE58_ALPHABET.length; i++) {
  BASE58_MAP.set(BASE58_ALPHABET[i], i);
}

/**
 * Encodes a Uint8Array into a Base58 string.
 * @param buffer The input Uint8Array.
 * @returns The Base58 encoded string.
 */
export function encodeBase58(buffer: Uint8Array): string {
  if (buffer.length === 0) {
    return "";
  }

  const digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] * 256;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }

  let output = "";
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    output += "1";
  }

  // Convert digits to Base58 characters
  for (let i = digits.length - 1; i >= 0; i--) {
    output += BASE58_ALPHABET[digits[i]];
  }

  return output;
}

/**
 * Decodes a Base58 string into a Uint8Array.
 * @param str The Base58 encoded string.
 * @returns The decoded Uint8Array.
 * @throws Error if the string contains invalid Base58 characters.
 */
export function decodeBase58(str: string): Uint8Array {
  if (str.length === 0) {
    return new Uint8Array(0);
  }

  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE58_MAP.get(char);
    if (value === undefined) {
      throw new Error(`Invalid Base58 character: ${char}`);
    }

    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry % 256;
      carry = Math.floor(carry / 256);
    }
    while (carry > 0) {
      bytes.push(carry % 256);
      carry = Math.floor(carry / 256);
    }
  }

  let output = new Uint8Array(0);
  // Add leading zeros
  for (let i = 0; i < str.length && str[i] === "1"; i++) {
    output = new Uint8Array([...output, 0]);
  }

  // Add the converted bytes, reversing order as they were pushed
  for (let i = bytes.length - 1; i >= 0; i--) {
    output = new Uint8Array([...output, bytes[i]]);
  }

  return output;
}

/**
 * Calculates the SHA256 hash of a Uint8Array.
 * Uses the Web Crypto API, which is available in modern browsers and Node.js (via webcrypto).
 * @param data The input Uint8Array.
 * @returns A Promise that resolves with the SHA256 hash as a Uint8Array.
 */
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  // Check for crypto.subtle availability, providing a graceful degradation or error
  // if not in a secure context or unsupported environment.
  // In a Next.js app, this should generally be available.
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data as BufferSource);
    return new Uint8Array(hashBuffer);
  } else if (typeof global !== 'undefined' && (global.crypto as any)?.webcrypto?.subtle) {
    // Node.js environment
    const hashBuffer = await (global.crypto as any).webcrypto.subtle.digest('SHA-256', data as BufferSource);
    return new Uint8Array(hashBuffer);
  } else {
    throw new Error("Web Crypto API (crypto.subtle) not available. Cannot perform SHA256 hashing.");
  }
}

/**
 * Base58Check: An extension of Base58 that adds a 4-byte checksum to the end of the data.
 * This checksum allows for verification of the data's integrity, protecting against
 * typos and corruption. It's widely used for Bitcoin addresses.
 *
 * The checksum is calculated by taking the first 4 bytes of the double SHA256 hash
 * of the data. The data, along with its checksum, is then Base58 encoded.
 */

/**
 * Encodes a Uint8Array into a Base58Check string.
 * @param buffer The input Uint8Array.
 * @returns A Promise that resolves with the Base58Check encoded string.
 */
export async function encodeBase58Check(buffer: Uint8Array): Promise<string> {
  const firstHash = await sha256(buffer);
  const secondHash = await sha256(firstHash);
  const checksum = secondHash.slice(0, 4); // Take the first 4 bytes for the checksum

  const dataWithChecksum = new Uint8Array(buffer.length + checksum.length);
  dataWithChecksum.set(buffer, 0);
  dataWithChecksum.set(checksum, buffer.length);

  return encodeBase58(dataWithChecksum);
}

/**
 * Decodes a Base58Check string into a Uint8Array and verifies its checksum.
 * @param str The Base58Check encoded string.
 * @returns A Promise that resolves with the decoded Uint8Array (without the checksum).
 * @throws Error if the checksum is invalid.
 */
export async function decodeBase58Check(str: string): Promise<Uint8Array> {
  const decoded = decodeBase58(str);
  if (decoded.length < 4) {
    throw new Error("Invalid Base58Check string: too short for checksum.");
  }

  const data = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);

  const firstHash = await sha256(data);
  const secondHash = await sha256(firstHash);
  const expectedChecksum = secondHash.slice(0, 4);

  // Compare checksums
  if (checksum.some((val, i) => val !== expectedChecksum[i])) {
    throw new Error("Invalid Base58Check string: checksum mismatch.");
  }

  return data;
}


// --- Keccak-256 Placeholder for EIP-55 ---
/**
 * Placeholder for Keccak-256 hashing function.
 * For a production environment, consider using a well-vetted library like `@adraffy/keccak` or `js-sha3`.
 * @param data The input Uint8Array.
 * @returns A Promise that resolves with the Keccak-256 hash as a Uint8Array.
 */
async function keccak256(data: Uint8Array): Promise<Uint8Array> {
  // IMPORTANT: This is a placeholder. A real Keccak-256 implementation is needed here.
  // For example, if using @adraffy/keccak:
  // import { keccak256 as adraffyKeccak256 } from '@adraffy/keccak';
  // return adraffyKeccak256(data);

  // Or if using js-sha3 (you'd need to convert input/output appropriately):
  // import { keccak256 as jsSha3Keccak256 } from 'js-sha3';
  // return new Uint8Array(Buffer.from(jsSha3Keccak256(data), 'hex')); // Example conversion

  console.warn("Using a placeholder keccak256 function. Please replace with a real implementation for production.");
  // Simulate a hash for development/testing if a real one isn't imported
  // This simulation is NOT cryptographically secure.
  const hash = new Uint8Array(32);
  for (let i = 0; i < data.length; i++) {
    hash[i % 32] = (hash[i % 32] + data[i]) % 256;
  }
  return Promise.resolve(hash);
}


/**
 * EIP-55: Mixed-case checksum address encoding for Ethereum.
 * This standard helps to guard against typos in Ethereum addresses.
 * The checksum is created by taking the Keccak-256 hash of the lowercase
 * hexadecimal address. If the Nth bit of the hash is 1, the Nth character
 * of the address is capitalized; otherwise, it is lowercased.
 *
 * Example:
 * Address: 0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeA8d
 * Lowercased: 0x5aaeb6053f3e94c9b9a09f33669435e7ef1bea8d
 * Keccak-256 hash of lowercased address (hex): 4f58bc12a52d627c268f7b767858c2b535787b64082531ac41a3d9b8979c322b
 * Result: 0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeA8d
 */

/**
 * Encodes an Ethereum address with EIP-55 checksum.
 * @param address The Ethereum address (hex string, with or without "0x" prefix).
 * @returns A Promise that resolves with the EIP-55 checksummed address.
 * @throws Error if the address is invalid.
 */
export async function encodeEip55(address: string): Promise<string> {
  const cleanedAddress = address.startsWith("0x") ? address.substring(2) : address;
  if (!/^[0-9a-fA-F]{40}$/.test(cleanedAddress)) {
    throw new Error("Invalid Ethereum address format.");
  }

  const lowercasedAddress = cleanedAddress.toLowerCase();
  const addressBuffer = new TextEncoder().encode(lowercasedAddress);
  const hashBuffer = await keccak256(addressBuffer);
  const hashHex = Array.from(hashBuffer).map(b => b.toString(16).padStart(2, '0')).join('');

  let checksumAddress = "0x";
  for (let i = 0; i < lowercasedAddress.length; i++) {
    if (parseInt(hashHex[i], 16) >= 8) {
      checksumAddress += lowercasedAddress[i].toUpperCase();
    } else {
      checksumAddress += lowercasedAddress[i];
    }
  }

  return checksumAddress;
}

/**
 * RLP (Recursive Length Prefix): A serialization format used in Ethereum
 * to encode arbitrarily nested arrays and byte strings. It is designed to be
 * simple, unambiguous, and byte-perfect.
 *
 * RLP encoding rules:
 * 1. For a single byte whose value is in the range [0x00, 0x7f],
 *    the RLP encoding is the byte itself.
 * 2. For a byte string whose length is 0-55 bytes, the RLP encoding
 *    consists of a single byte with value 0x80 plus the length of the string,
 *    followed by the string itself. (0x80 + length + string)
 * 3. For a byte string whose length is greater than 55 bytes, the RLP encoding
 *    consists of a single byte with value 0xb7 plus the length of the length
 *    of the string in bytes, followed by the length of the string,
 *    followed by the string itself. (0xb7 + length_of_length + length + string)
 * 4. For a list whose total payload length is 0-55 bytes, the RLP encoding
 *    consists of a single byte with value 0xc0 plus the length of the payload,
 *    followed by the concatenation of the RLP encodings of the items in the list.
 *    (0xc0 + length + item1_rlp + item2_rlp + ...)
 * 5. For a list whose total payload length is greater than 55 bytes, the RLP encoding
 *    consists of a single byte with value 0xf7 plus the length of the length
 *    of the payload in bytes, followed by the length of the payload,
 *    followed by the concatenation of the RLP encodings of the items in the list.
 *    (0xf7 + length_of_length + length + item1_rlp + item2_rlp + ...)
 */

// Helper to convert number to Buffer (Uint8Array)
function toBuffer(value: number | bigint): Uint8Array {
  if (typeof value === 'number' && value === 0) {
    return new Uint8Array(0);
  }
  const hex = value.toString(16);
  // Pad with leading zero if odd length
  const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
  return new Uint8Array(paddedHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
}

// Helper to calculate length prefix
function encodeLength(len: number, offset: number): Uint8Array {
  if (len < 56) {
    return new Uint8Array([offset + len]);
  } else {
    const lenBuffer = toBuffer(len);
    return new Uint8Array([offset + 0x37 + lenBuffer.length, ...lenBuffer]);
  }
}

/**
 * Encodes a value (string, Uint8Array, number, bigint, or array of RLP-encodable values)
 * into its RLP representation.
 * @param input The value to RLP encode.
 * @returns The RLP encoded Uint8Array.
 */
export function rlpEncode(input: any): Uint8Array {
  if (typeof input === 'string') {
    // Treat strings as UTF-8 byte arrays
    input = new TextEncoder().encode(input);
  } else if (typeof input === 'number' || typeof input === 'bigint') {
    input = toBuffer(input);
  }

  if (input instanceof Uint8Array) {
    if (input.length === 1 && input[0] < 0x80) {
      return input; // Rule 1
    } else {
      const lengthPrefix = encodeLength(input.length, 0x80); // Rule 2 & 3
      return new Uint8Array([...lengthPrefix, ...input]);
    }
  } else if (Array.isArray(input)) {
    const encodedChildren: Uint8Array[] = input.map(item => rlpEncode(item));
    const childrenPayload = new Uint8Array(
      encodedChildren.reduce((acc, curr) => acc + curr.length, 0)
    );
    let offset = 0;
    for (const child of encodedChildren) {
      childrenPayload.set(child, offset);
      offset += child.length;
    }
    const lengthPrefix = encodeLength(childrenPayload.length, 0xc0); // Rule 4 & 5
    return new Uint8Array([...lengthPrefix, ...childrenPayload]);
  } else {
    throw new Error("RLP encoding supports only strings, Uint8Arrays, numbers, bigints, or arrays thereof.");
  }
}

/**
 * Decodes an RLP encoded Uint8Array.
 * @param input The RLP encoded Uint8Array.
 * @returns The decoded value (Uint8Array or array of decoded values).
 */
export function rlpDecode(input: Uint8Array): any {
  if (input.length === 0) {
    return new Uint8Array(0);
  }

  let offset = 0;

  function _decode(data: Uint8Array): [any, number] {
    const firstByte = data[offset];
    let length: number;
    let lenPrefixSize: number; // Declare here
    let lengthOfLengthBytes: number; // Declare here

    // Rule 1: Single byte
    if (firstByte <= 0x7f) {
      offset++;
      return [data.slice(offset - 1, offset), 1];
    }

    // Rule 2 & 3: String
    if (firstByte <= 0xbf) {
      if (firstByte <= 0xaf) { // Length 0-55 bytes
        length = firstByte - 0x80;
        lenPrefixSize = 1;
        offset++;
      } else { // Length > 55 bytes
        lengthOfLengthBytes = firstByte - 0xb7;
        lenPrefixSize = 1 + lengthOfLengthBytes;
        offset++;
        length = parseInt(Array.from(data.slice(offset, offset + lengthOfLengthBytes)).map(b => b.toString(16).padStart(2, '0')).join(''), 16);
        offset += lengthOfLengthBytes;
      }
      const value = data.slice(offset, offset + length);
      offset += length;
      return [value, lenPrefixSize + length];
    }

    // Rule 4 & 5: List
    if (firstByte <= 0xff) {
      if (firstByte <= 0xf7) { // Payload length 0-55 bytes
        length = firstByte - 0xc0;
        lenPrefixSize = 1;
        offset++;
      } else { // Payload length > 55 bytes
        lengthOfLengthBytes = firstByte - 0xf7;
        lenPrefixSize = 1 + lengthOfLengthBytes;
        offset++;
        length = parseInt(Array.from(data.slice(offset, offset + lengthOfLengthBytes)).map(b => b.toString(16).padStart(2, '0')).join(''), 16);
        offset += lengthOfLengthBytes;
      }

      const list: any[] = [];
      const startPayloadOffset = offset;
      while (offset < startPayloadOffset + length) {
        const [item, itemLength] = _decode(data);
        list.push(item);
      }
      return [list, lenPrefixSize + length];
    }

    throw new Error(`RLP decoding error: Invalid first byte ${firstByte.toString(16)}`);
  }

  const [decodedValue] = _decode(input);
  return decodedValue;
}
