"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Code, File, Sparkle, ClipboardText, Cube } from "@phosphor-icons/react";

export default function ByteConverter() {
  const MAX_BYTES = 10000;
  const [text, setText] = useState("");
  const [fileBytes, setFileBytes] = useState<number[]>([]);
  const [fileName, setFileName] = useState("");
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [inputMode, setInputMode] = useState<'text' | 'hex'>('text');
  const [fileMode, setFileMode] = useState<'binary' | 'hex'>('binary');
  const [copyStatus, setCopyStatus] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  let textBytes: number[] = [];
  let textHexError = '';

  if (inputMode === 'text') {
    textBytes = textToBytes(text);
  } else { // inputMode === 'hex'
    try {
      textBytes = hexToBytes(text);
      textHexError = '';
    } catch (err) {
      textHexError = (err as Error).message;
      textBytes = [];
    }
  }

  const currentBytes = activeTab === 'text' ? textBytes : fileBytes;

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  function textToBytes(str: string) {
    const encoder = new TextEncoder();
    return Array.from(encoder.encode(str));
  }

  function hexToBytes(hexString: string): number[] {
    const sanitized = hexString
      .replace(/0x/g, '')
      .replace(/\s/g, '');

    if (sanitized.length === 0) {
      return [];
    }
    if (sanitized.length % 2 !== 0) {
      throw new Error('Invalid hex string length (must be even).');
    }
    if (!/^[0-9a-fA-F]*$/.test(sanitized)) {
      throw new Error('Invalid characters in hex string.');
    }

    const bytes: number[] = [];
    for (let i = 0; i < sanitized.length; i += 2) {
      bytes.push(parseInt(sanitized.substr(i, 2), 16));
    }
    return bytes;
  }
  
  const bytesToCompactHex = (bytes: number[]): string => {
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const bytesToBinary = (bytes: number[]): string => {
    if (bytes.length === 0) return '';
    return bytes.map(b => b.toString(2).padStart(8, '0')).join(' ');
  };

  // New helper function for Unicode Decimal conversion
  const bytesToUnicodeDecimals = (bytes: number[]): string => {
    if (bytes.length === 0) return '';
    try {
        const text = new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
        return Array.from(text).map(char => char.codePointAt(0)!.toString()).join(' ');
    } catch (e) {
        return `[Invalid UTF-8 sequence for Unicode conversion: ${(e as Error).message}]`;
    }
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (fileMode === 'hex') {
      reader.onload = (event) => {
        const textValue = event.target?.result as string;
        try {
          const bytes = hexToBytes(textValue);
          setFileBytes(bytes);
          if (bytes.length > MAX_BYTES) {
            showToast(`Large file detected (${bytes.length} bytes). Displaying first 500 only.`, 'info');
          }
        } catch {
          setFileBytes([]);
          showToast('Invalid hex content in file.', 'error');
        }
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        const byteArray = Array.from(bytes);
        setFileBytes(byteArray);

        if (byteArray.length > MAX_BYTES) {
          showToast(`Large file detected (${byteArray.length} bytes). Displaying first 500 only.`, 'info');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const bytesToHex = (bytes: number[]) =>
    bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ');

  const bytesToText = (bytes: number[]) => {
    if (bytes.length === 0) return '';

    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      return decoder.decode(new Uint8Array(bytes));
    } catch {
      return '[Invalid UTF-8 sequence]';
    }
  };

  const handleCopyBytes = async () => {
    if (currentBytes.length === 0) {
      showToast('Nothing to copy.', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(currentBytes.join(', '));
      showToast('Copied bytes to clipboard!', 'success');
      setCopyStatus('Copied to clipboard!');
      setTimeout(() => setCopyStatus(''), 1800);
    } catch {
      showToast('Copy failed.', 'error');
      setCopyStatus('Copy failed.');
      setTimeout(() => setCopyStatus(''), 1800);
    }
  };

  const handleCopyHex = async () => {
    if (currentBytes.length === 0) {
      showToast('Nothing to copy.', 'info');
      return;
    }

    try {
      const hex = bytesToHex(currentBytes);
      await navigator.clipboard.writeText(hex);
      showToast('Copied hex string to clipboard!', 'success');
      setCopyStatus('Copied hex to clipboard!');
      setTimeout(() => setCopyStatus(''), 1800);
    } catch {
      showToast('Hex copy failed.', 'error');
      setCopyStatus('Hex copy failed.');
      setTimeout(() => setCopyStatus(''), 1800);
    }
  };

  const handleClearAll = () => {
    setText('');
    setFileBytes([]);
    setFileName('');
    setCopyStatus('');
    showToast('All data cleared.', 'info');
  };

  // --- Mode Switching Logic ---
  const handleSetInputMode = (mode: 'text' | 'hex') => {
    if (inputMode === mode) return; // No change needed

    if (mode === 'hex') {
      // Current mode is 'text', convert current text to hex
      const bytes = textToBytes(text);
      setText(bytesToCompactHex(bytes));
    } else { // Switching to 'text' mode
      // Current mode is 'hex', convert current hex to text
      try {
        const bytes = hexToBytes(text);
        setText(bytesToText(bytes));
      } catch (e: any) {
        // If current hex input is invalid, clear it or show error
        showToast(`Cannot convert invalid hex to text: ${e.message}`, 'error');
        setText(''); // Clear invalid hex input
      }
    }
    setInputMode(mode);
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {toast && (
        <div className={`fixed top-6 z-50 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg ${
          toast.type === 'success'
            ? 'bg-emerald-600 text-white'
            : toast.type === 'error'
            ? 'bg-rose-500 text-white'
            : 'bg-sky-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
      <Card className="w-full max-w-2xl border border-sky-200/60 bg-white/95 dark:bg-slate-900/80 dark:border-sky-800 shadow-xl shadow-sky-300/20 animate__animated animate__fadeIn">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300">
              <Sparkle className="h-5 w-5" weight="fill" />
              <CardTitle className="text-2xl">Byte Converter</CardTitle>
            </div>
            <Link href="/encoding-demo" className="flex items-center gap-1 text-sm text-sky-600 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-100 transition-colors">
              <Cube className="h-4 w-4" weight="fill" />
              Encoding Demo
            </Link>
          </div>
          <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
            Convert text or files into byte arrays instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'file')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center justify-center gap-2">
                <Code className="h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center justify-center gap-2">
                <File className="h-4 w-4" />
                File Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-semibold dark:bg-sky-900/50 dark:text-sky-200">
                  Text bytes: {textBytes.length}
                </span>
                <div className="flex items-center gap-2 animate__animated animate__fadeInUp animate__delay-1s">
                  <label className="text-xs">Input mode:</label>
                  <button onClick={() => handleSetInputMode('text')} className={`rounded px-2 py-1 text-xs ${inputMode === 'text' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                    UTF-8
                  </button>
                  <button onClick={() => handleSetInputMode('hex')} className={`rounded px-2 py-1 text-xs ${inputMode === 'hex' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                    Hex
                  </button>
                </div>
                <button onClick={handleCopyBytes} disabled={textBytes.length === 0} className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300">
                  Copy bytes
                </button>
                <button onClick={handleCopyHex} disabled={textBytes.length === 0} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300">
                  Copy hex
                </button>
                <button onClick={handleClearAll} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  Clear all
                </button>
                {copyStatus && <span className="text-xs text-emerald-600 dark:text-emerald-300">{copyStatus}</span>}
              </div>
              {textHexError && (
                <div className="rounded-md bg-rose-100 px-2 py-1 text-xs text-rose-700 dark:bg-rose-200/20 dark:text-rose-300">
                  {textHexError}
                </div>
              )}
              {textBytes.length > MAX_BYTES && (
                <div className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-200/20 dark:text-amber-300">
                  Warning: Text converted bytes exceed {MAX_BYTES}. Only the first 500 bytes are shown below.
                </div>
              )}

              <Textarea
                placeholder={inputMode === 'hex' ? "Enter hex string (e.g., 48656c6c6f)" : "Type something here..."}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[150px] border-sky-300 focus:border-sky-500 focus:ring-sky-300 animate__animated animate__fadeInUp animate__delay-2s"
              />

              {/* Unicode (Decimal) Output */}
              <div className="p-4 bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-md overflow-hidden animate__animated animate__fadeInUp animate__delay-3s">
                <div className="flex items-center gap-2 mb-2 text-sky-700 dark:text-sky-200">
                  <ClipboardText className="h-4 w-4" />
                  <span className="text-xs font-semibold">Unicode (Decimal) Output</span>
                </div>
                <p className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">
                  {bytesToUnicodeDecimals(textBytes)}
                </p>
              </div>

              {/* Binary Output */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden animate__animated animate__fadeInUp animate__delay-4s">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <ClipboardText className="h-4 w-4" />
                  <span className="text-xs font-semibold">Binary Output</span>
                </div>
                <p className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">
                  {bytesToBinary(textBytes)}
                </p>
              </div>

              {/* Hexadecimal Output */}
              <div className="p-4 bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-md animate__animated animate__fadeInUp animate__delay-5s">
                <div className="flex items-center gap-2 mb-2 text-sky-700 dark:text-sky-200">
                  <ClipboardText className="h-4 w-4" />
                  <span className="text-xs font-semibold">Hexadecimal Output</span>
                </div>
                <p className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">
                  {bytesToHex(textBytes)}
                </p>
              </div>

              {/* UTF-8/ASCII Output */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md animate__animated animate__fadeInUp animate__delay-6s">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                  <ClipboardText className="h-4 w-4" />
                  <span className="text-xs font-semibold">UTF-8/ASCII Output</span>
                </div>
                <p className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">
                  {bytesToText(textBytes)}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4 py-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="rounded-full bg-sky-100 text-sky-800 px-3 py-1 text-xs font-semibold dark:bg-sky-900/50 dark:text-sky-200">
                  File bytes: {fileBytes.length}
                </span>
                <div className="flex items-center gap-2 animate__animated animate__fadeInUp animate__delay-1s">
                  <label className="text-xs">File mode:</label>
                  <button onClick={() => setFileMode('binary')} className={`rounded px-2 py-1 text-xs ${fileMode === 'binary' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                    Binary
                  </button>
                  <button onClick={() => setFileMode('hex')} className={`rounded px-2 py-1 text-xs ${fileMode === 'hex' ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'}`}>
                    Hex
                  </button>
                </div>
                <button onClick={handleCopyBytes} disabled={fileBytes.length === 0} className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300">
                  Copy bytes
                </button>
                <button onClick={handleCopyHex} disabled={fileBytes.length === 0} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300">
                  Copy hex
                </button>
                <button onClick={handleClearAll} className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                  Clear all
                </button>
                {copyStatus && <span className="text-xs text-emerald-600 dark:text-emerald-300">{copyStatus}</span>}
              </div>
              {fileBytes.length > MAX_BYTES && (
                <div className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700 dark:bg-amber-200/20 dark:text-amber-300">
                  Warning: File byte count exceeds {MAX_BYTES}. Display output is truncated.
                </div>
              )}

              <Input type="file" onChange={handleFileChange} className="border-sky-300 focus:border-sky-500 focus:ring-sky-300 animate__animated animate__fadeInUp animate__delay-2s" />

              {fileName && (
                <div className="space-y-2 animate__animated animate__fadeInUp animate__delay-3s">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <File className="inline h-4 w-4 mr-1 text-sky-500" />
                    File: {fileName} ({fileBytes.length} bytes)
                  </p>
                  <div className="p-4 bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-md max-h-[200px] overflow-y-auto animate__animated animate__fadeInUp animate__delay-4s">
                    <p className="text-xs font-mono break-all text-slate-700 dark:text-slate-300">
                      {fileBytes.slice(0, 500).join(", ")}
                      {fileBytes.length > 500 && " ... [truncated]"}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md animate__animated animate__fadeInUp animate__delay-5s">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Decoded text (UTF-8)</p>
                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{bytesToText(fileBytes)}</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
