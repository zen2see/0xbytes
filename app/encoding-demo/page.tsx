"use client";

import { useState } from "react";
import {
  encodeBase58,
  decodeBase58,
  encodeBase58Check,
  decodeBase58Check,
  encodeEip55,
  rlpEncode,
  rlpDecode,
} from "../../lib/encoding"; // Adjust path as needed
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EncodingDemoPage() {
  // Base58 State
  const [base58Input, setBase58Input] = useState("Hello World");
  const [encodedBase58, setEncodedBase58] = useState("");
  const [decodedBase58, setDecodedBase58] = useState("");
  const [base58Error, setBase58Error] = useState("");

  // Base58Check State
  const [base58CheckInput, setBase58CheckInput] = useState("Hello Base58Check");
  const [encodedBase58Check, setEncodedBase58Check] = useState("");
  const [decodedBase58Check, setDecodedBase58Check] = useState("");
  const [base58CheckError, setBase58CheckError] = useState("");

  // EIP-55 State
  const [eip55Input, setEip55Input] = useState(
    "0x5aaeb6053f3e94c9b9a09f33669435e7ef1bea8d"
  );
  const [encodedEip55, setEncodedEip55] = useState("");
  const [eip55Error, setEip55Error] = useState("");

  // RLP State
  const [rlpInput, setRlpInput] = useState(`["dog", "cat", "cow"]`);
  const [encodedRlp, setEncodedRlp] = useState("");
  const [decodedRlp, setDecodedRlp] = useState("");
  const [rlpError, setRlpError] = useState("");

  const handleEncodeBase58 = () => {
    try {
      setBase58Error("");
      const buffer = new TextEncoder().encode(base58Input);
      setEncodedBase58(encodeBase58(buffer));
    } catch (e: any) {
      setBase58Error(e.message);
      setEncodedBase58("");
    }
  };

  const handleDecodeBase58 = () => {
    try {
      setBase58Error("");
      const decodedBuffer = decodeBase58(encodedBase58);
      setDecodedBase58(new TextDecoder().decode(decodedBuffer));
    } catch (e: any) {
      setBase58Error(e.message);
      setDecodedBase58("");
    }
  };

  const handleEncodeBase58Check = async () => {
    try {
      setBase58CheckError("");
      const buffer = new TextEncoder().encode(base58CheckInput);
      setEncodedBase58Check(await encodeBase58Check(buffer));
    } catch (e: any) {
      setBase58CheckError(e.message);
      setEncodedBase58Check("");
    }
  };

  const handleDecodeBase58Check = async () => {
    try {
      setBase58CheckError("");
      const decodedBuffer = await decodeBase58Check(encodedBase58Check);
      setDecodedBase58Check(new TextDecoder().decode(decodedBuffer));
    } catch (e: any) {
      setBase58CheckError(e.message);
      setDecodedBase58Check("");
    }
  };

  const handleEncodeEip55 = async () => {
    try {
      setEip55Error("");
      setEncodedEip55(await encodeEip55(eip55Input));
    } catch (e: any) {
      setEip55Error(e.message);
      setEncodedEip55("");
    }
  };

  const handleEncodeRlp = () => {
    try {
      setRlpError("");
      // Simple JSON parsing for demonstration purposes
      const parsedInput = JSON.parse(rlpInput);
      const encoded = rlpEncode(parsedInput);
      setEncodedRlp(
        "0x" + Array.from(encoded).map((b) => b.toString(16).padStart(2, "0")).join("")
      );
    } catch (e: any) {
      setRlpError(e.message);
      setEncodedRlp("");
    }
  };

  const handleDecodeRlp = () => {
    try {
      setRlpError("");
      const buffer = Uint8Array.from(
        encodedRlp.substring(2).match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );
      const decoded = rlpDecode(buffer);
      // For demonstration, convert Uint8Arrays in the result back to string
      const stringifiedDecoded = JSON.stringify(decoded, (key, value) => {
        if (value instanceof Uint8Array) {
          return new TextDecoder().decode(value);
        }
        return value;
      }, 2);
      setDecodedRlp(stringifiedDecoded);
    } catch (e: any) {
      setRlpError(e.message);
      setDecodedRlp("");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Encoding & Hashing Demo</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* Base58 Card */}
        <Card className="animate__animated animate__fadeIn">
          <CardHeader>
            <CardTitle>Base58 Encoding/Decoding</CardTitle>
            <p className="text-sm text-gray-500">
              Used in cryptocurrencies like Bitcoin. Omits visually similar characters.
            </p>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Input for Base58"
              value={base58Input}
              onChange={(e) => setBase58Input(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2 mb-2">
              <Button onClick={handleEncodeBase58}>Encode Base58</Button>
              <Button onClick={handleDecodeBase58} disabled={!encodedBase58}>
                Decode Base58 (from Encoded)
              </Button>
            </div>
            {encodedBase58 && (
              <p className="break-all text-sm mt-2">
                <strong>Encoded:</strong> {encodedBase58}
              </p>
            )}
            {decodedBase58 && (
              <p className="break-all text-sm">
                <strong>Decoded:</strong> {decodedBase58}
              </p>
            )}
            {base58Error && (
              <p className="text-red-500 text-sm mt-2">{base58Error}</p>
            )}
          </CardContent>
        </Card>

        {/* Base58Check Card */}
        <Card className="animate__animated animate__fadeIn">
          <CardHeader>
            <CardTitle>Base58Check Encoding/Decoding</CardTitle>
            <p className="text-sm text-gray-500">
              Base58 with a 4-byte SHA256 checksum for error detection.
            </p>
            <p className="text-sm text-red-500">
              Note: SHA256 uses Web Crypto API.
            </p>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Input for Base58Check"
              value={base58CheckInput}
              onChange={(e) => setBase58CheckInput(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2 mb-2">
              <Button onClick={handleEncodeBase58Check}>
                Encode Base58Check
              </Button>
              <Button
                onClick={handleDecodeBase58Check}
                disabled={!encodedBase58Check}
              >
                Decode Base58Check (from ...)
              </Button>
            </div>
            {encodedBase58Check && (
              <p className="break-all text-sm mt-2">
                <strong>Encoded:</strong> {encodedBase58Check}
              </p>
            )}
            {decodedBase58Check && (
              <p className="break-all text-sm">
                <strong>Decoded:</strong> {decodedBase58Check}
              </p>
            )}
            {base58CheckError && (
              <p className="text-red-500 text-sm mt-2">
                {base58CheckError}
              </p>
            )}
          </CardContent>
        </Card>

        {/* EIP-55 Card */}
        <Card className="animate__animated animate__fadeIn">
          <CardHeader>
            <CardTitle>EIP-55 Checksum Encoding</CardTitle>
            <p className="text-sm text-gray-500">
              Ethereum address checksum using mixed-case characters.
            </p>
            <p className="text-sm text-red-500">
              Note: Uses placeholder Keccak-256. For production, integrate a
              library like @adraffy/keccak.
            </p>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ethereum Address (e.g., 0x...)"
              value={eip55Input}
              onChange={(e) => setEip55Input(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleEncodeEip55} className="mb-2">
              Encode EIP-55
            </Button>
            {encodedEip55 && (
              <p className="break-all text-sm mt-2">
                <strong>Checksummed Address:</strong> {encodedEip55}
              </p>
            )}
            {eip55Error && (
              <p className="text-red-500 text-sm mt-2">{eip55Error}</p>
            )}
          </CardContent>
        </Card>

        {/* RLP Card */}
        <Card className="animate__animated animate__fadeIn">
          <CardHeader>
            <CardTitle>RLP Encoding/Decoding</CardTitle>
            <p className="text-sm text-gray-500">
              Recursive Length Prefix: Ethereum serialization format for data structures.
            </p>
            <p className="text-sm text-gray-500">
              Input for RLP should be JSON representing a string, number, or array.
            </p>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={`e.g., ["Hello", "World", 123] or "Hello World"`}
              value={rlpInput}
              onChange={(e) => setRlpInput(e.target.value)}
              className="mb-2 font-mono"
              rows={4}
            />
            <div className="flex space-x-2 mb-2">
              <Button onClick={handleEncodeRlp}>Encode RLP</Button>
              <Button onClick={handleDecodeRlp} disabled={!encodedRlp}>
                Decode RLP (from Encoded)
              </Button>
            </div>
            {encodedRlp && (
              <p className="break-all text-sm mt-2">
                <strong>Encoded (hex):</strong> {encodedRlp}
              </p>
            )}
            {decodedRlp && (
              <p className="break-all text-sm">
                <strong>Decoded:</strong> <pre className="text-xs">{decodedRlp}</pre>
              </p>
            )}
            {rlpError && (
              <p className="text-red-500 text-sm mt-2">{rlpError}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
