// Dynamically importing html2pdf.js inline to avoid Vite/SSR build issues

export interface PdfExportOptions {
  filename?: string;
  margin?: number | [number, number, number, number];
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  quality?: number;
  enableLinks?: boolean;
}

/**
 * Exports any DOM element to a professional, multi-page PDF using html2pdf.js
 */
export async function exportElementToPdf(
  elementOrId: HTMLElement | string,
  customOptions: PdfExportOptions = {}
): Promise<void> {
  const element = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;

  if (!element) {
    throw new Error(`Target DOM element not found for PDF export`);
  }

  const filename = customOptions.filename || `Tusafiri-Document-${new Date().toISOString().slice(0, 10)}.pdf`;
  const orientation = customOptions.orientation || 'portrait';
  const format = customOptions.format || 'a4';
  const margin = customOptions.margin ?? [10, 10, 10, 10]; // mm margins

  // Configure html2pdf parameters
  const opt = {
    margin: margin,
    filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: customOptions.quality || 0.98 },
    html2canvas: {
      scale: 2, // High resolution crisp text and vectors
      useCORS: true,
      logging: false,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: {
      unit: 'mm',
      format: format,
      orientation: orientation,
      compress: true,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['.page-break-avoid', 'tr', '.voucher-card', '.itinerary-day-card', '.pricing-card']
    }
  };

  try {
    // Execute html2pdf worker via dynamic import to avoid SSR/Vite issues
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default || html2pdfModule;
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('html2pdf generation error:', error);
    // Fallback: trigger standard browser print dialog
    window.print();
    throw error;
  }
}
