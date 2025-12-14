declare module 'pdf-parse/lib/pdf-parse.js' {
    import type { Buffer } from 'buffer';
  
    interface PDFInfo {
      numpages: number;
      numrender: number;
      info: Record<string, unknown>;
      metadata?: unknown;
      version: string;
    }
  
    interface PDFParseResult {
      numpages: number;
      numrender: number;
      info: Record<string, unknown>;
      metadata?: unknown;
      text: string;
      version: string;
      infoPDF?: PDFInfo;
    }
  
    function pdf(data: Buffer | Uint8Array): Promise<PDFParseResult>;
    export = pdf;
  }
  