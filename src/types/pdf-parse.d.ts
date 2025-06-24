declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion?: string
    IsAcroFormPresent?: boolean
    IsXFAPresent?: boolean
    Title?: string
    Author?: string
    Subject?: string
    Creator?: string
    Producer?: string
    CreationDate?: string
    ModDate?: string
  }

  interface PDFData {
    numpages: number
    numrender: number
    info: PDFInfo
    metadata: any
    text: string
    version: string
  }

  function pdfParse(buffer: Buffer): Promise<PDFData>
  export = pdfParse
} 