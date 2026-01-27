/**
 * Lineup PDF Export - Phase 18 LINEUP-05 (Enhanced)
 *
 * Enhanced PDF export with QR codes linking to digital lineup version.
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPdfOptions {
  includeQRCode?: boolean;
  lineupId?: string;
  baseUrl?: string;
}

/**
 * Convert a React QR code element to a data URL
 */
async function qrCodeToDataUrl(lineupId: string, baseUrl: string): Promise<string> {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.background = 'white';
  container.style.padding = '8px';
  document.body.appendChild(container);

  // Dynamically import qrcode.react and render
  const { QRCodeCanvas } = await import('qrcode.react');
  const { createRoot } = await import('react-dom/client');
  const React = await import('react');

  const url = `${baseUrl}/lineups/${lineupId}/view`;

  return new Promise((resolve) => {
    const root = createRoot(container);
    root.render(
      React.createElement(QRCodeCanvas, {
        value: url,
        size: 100,
        level: 'H',
        includeMargin: true,
        // Use callback to get data URL when rendered
        bgColor: '#ffffff',
        fgColor: '#000000',
      })
    );

    // Wait for render then extract canvas
    setTimeout(() => {
      const canvas = container.querySelector('canvas');
      if (canvas) {
        resolve(canvas.toDataURL('image/png'));
      } else {
        resolve('');
      }
      root.unmount();
      document.body.removeChild(container);
    }, 100);
  });
}

/**
 * Export lineup container element to PDF with optional QR code
 *
 * @param element - The DOM element containing the lineup visual
 * @param filename - Output filename (without .pdf extension)
 * @param options - Export options including QR code settings
 */
export async function exportLineupToPdf(
  element: HTMLElement,
  filename: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  const { includeQRCode = false, lineupId, baseUrl = window.location.origin } = options;

  // Capture element as canvas
  const canvas = await html2canvas(element, {
    scale: 2, // Higher resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });

  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const pdf = new jsPDF('p', 'mm', 'a4');

  // Add lineup image
  const imgData = canvas.toDataURL('image/png');
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

  // Add QR code if requested
  if (includeQRCode && lineupId) {
    try {
      const qrDataUrl = await qrCodeToDataUrl(lineupId, baseUrl);
      if (qrDataUrl) {
        // Position QR code in bottom right corner
        const qrSize = 25; // mm
        const qrX = imgWidth - qrSize - 10; // 10mm margin from right
        const qrY = Math.min(imgHeight + 5, pageHeight - qrSize - 10); // Below content or near bottom

        pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

        // Add small label under QR code
        pdf.setFontSize(6);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Scan for digital version', qrX + qrSize / 2, qrY + qrSize + 3, {
          align: 'center',
        });
      }
    } catch (error) {
      console.warn('Failed to add QR code to PDF:', error);
      // Continue without QR code
    }
  }

  // Save the PDF
  pdf.save(`${filename}.pdf`);
}

/**
 * Export multiple boats to a single PDF (multiple boats per page)
 */
export async function exportMultiBoatPdf(
  elements: HTMLElement[],
  filename: string,
  options: ExportPdfOptions = {}
): Promise<void> {
  const { includeQRCode = false, lineupId, baseUrl = window.location.origin } = options;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  let currentY = margin;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
    });

    const aspectRatio = canvas.width / canvas.height;
    const imgW = imgWidth - margin * 2;
    const imgH = imgW / aspectRatio;

    // Check if we need a new page
    if (currentY + imgH > pageHeight - margin) {
      pdf.addPage();
      currentY = margin;
    }

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', margin, currentY, imgW, imgH);
    currentY += imgH + 5; // 5mm gap between boats
  }

  // Add QR code on last page if requested
  if (includeQRCode && lineupId) {
    try {
      const qrDataUrl = await qrCodeToDataUrl(lineupId, baseUrl);
      if (qrDataUrl) {
        const qrSize = 20;
        const qrX = imgWidth - qrSize - margin;
        const qrY = pageHeight - qrSize - margin;

        pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
        pdf.setFontSize(6);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Scan for digital version', qrX + qrSize / 2, qrY + qrSize + 2, {
          align: 'center',
        });
      }
    } catch (error) {
      console.warn('Failed to add QR code to PDF:', error);
    }
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Simple PDF export without QR code (backward compatible)
 */
export async function exportSimplePdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  return exportLineupToPdf(element, filename, { includeQRCode: false });
}
