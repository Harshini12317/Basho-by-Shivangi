/* ---------------- Types ---------------- */

interface OrderItem {
  productSlug: string;
  price: number;
  qty: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  gstNumber?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Order {
  razorpayOrderId: string;
  createdAt: string | Date;
  customer: CustomerInfo;
  address: Address;
  items: OrderItem[];
  hsnCode?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

import { jsPDF } from 'jspdf';

/* ---------------- Types ---------------- */

interface OrderItem {
  productSlug: string;
  price: number;
  qty: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  gstNumber?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface Order {
  razorpayOrderId: string;
  createdAt: string | Date;
  customer: CustomerInfo;
  address: Address;
  items: OrderItem[];
  hsnCode?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

/* ============= PDF Invoice Generator (Using jsPDF) ============= */

export function generateInvoicePDF(order: Order): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 10;

      // Set font
      doc.setFont('helvetica');

      // Header - Company Info
      doc.setFontSize(20);
      doc.setTextColor(142, 80, 34); // Basho brown color
      doc.text('BASHO POTTERY', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Handcrafted Ceramics & Studio', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;

      doc.text('GSTIN: 22AAAAA0000A1Z5', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Divider line
      doc.setDrawColor(142, 80, 34);
      doc.setLineWidth(0.5);
      doc.line(10, yPosition, pageWidth - 10, yPosition);
      yPosition += 8;

      // Invoice Title
      doc.setFontSize(16);
      doc.setTextColor(142, 80, 34);
      doc.text('TAX INVOICE', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Invoice Details
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      const invoiceDate = new Date(order.createdAt).toLocaleDateString();
      doc.text(`Invoice No: ${order.razorpayOrderId}`, 10, yPosition);
      doc.text(`Invoice Date: ${invoiceDate}`, pageWidth / 2, yPosition);
      yPosition += 8;

      // Billing & Shipping Details
      doc.setFontSize(10);
      doc.setTextColor(142, 80, 34);
      doc.text('BILL TO:', 10, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(order.customer.name, 10, yPosition);
      yPosition += 5;
      doc.text(order.customer.email, 10, yPosition);
      yPosition += 5;
      doc.text(order.customer.phone, 10, yPosition);
      yPosition += 5;
      if (order.customer.gstNumber) {
        doc.text(`GSTIN: ${order.customer.gstNumber}`, 10, yPosition);
        yPosition += 5;
      }

      // Ship To - Right side
      doc.setFontSize(10);
      doc.setTextColor(142, 80, 34);
      doc.text('SHIP TO:', pageWidth / 2, yPosition - 16);
      yPosition = Math.max(yPosition, 90);

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(order.address.street, pageWidth / 2, yPosition - 10);
      doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zip}`, pageWidth / 2, yPosition - 5);

      yPosition += 12;

      // Items Table Header
      const tableStartY = yPosition;
      doc.setFillColor(242, 242, 242);
      doc.rect(10, tableStartY, pageWidth - 20, 7, 'F');

      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('Description', 12, tableStartY + 5);
      doc.text('HSN', 100, tableStartY + 5);
      doc.text('Qty', 130, tableStartY + 5);
      doc.text('Rate', 150, tableStartY + 5);
      doc.text('Amount', 180, tableStartY + 5, { align: 'right' });

      yPosition += 10;

      // Items
      order.items.forEach((item, index) => {
        const description = item.productSlug.substring(0, 40);
        doc.text(description, 12, yPosition);
        doc.text(order.hsnCode || '-', 100, yPosition);
        doc.text(item.qty.toString(), 130, yPosition);
        doc.text(`₹${item.price}`, 150, yPosition);
        doc.text(`₹${(item.price * item.qty).toFixed(2)}`, 185, yPosition, { align: 'right' });
        yPosition += 7;
      });

      // Totals Section
      yPosition += 5;
      doc.setDrawColor(142, 80, 34);
      doc.setLineWidth(0.3);
      doc.line(100, yPosition, pageWidth - 10, yPosition);
      yPosition += 6;

      doc.setFontSize(9);
      doc.text('Subtotal', 150, yPosition);
      doc.text(`₹${order.subtotal.toFixed(2)}`, 185, yPosition, { align: 'right' });
      yPosition += 7;

      if (order.gstAmount > 0) {
        doc.text('Tax (18%)', 150, yPosition);
        doc.text(`₹${order.gstAmount.toFixed(2)}`, 185, yPosition, { align: 'right' });
        yPosition += 7;
      }

      // Grand Total
      doc.setFontSize(11);
      doc.setTextColor(142, 80, 34);
      doc.setFont('helvetica', 'bold');
      doc.text('Grand Total', 150, yPosition);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 185, yPosition, { align: 'right' });

      // Footer
      yPosition = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for shopping with Bashō Pottery', pageWidth / 2, yPosition, { align: 'center' });
      doc.text('This is a computer-generated invoice and does not require a signature', pageWidth / 2, yPosition + 5, { align: 'center' });

      // Convert to buffer
      const pdfData = doc.output('arraybuffer');
      const buffer = Buffer.from(pdfData);
      resolve(buffer);
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      reject(error);
    }
  });
}

/* ============= HTML Invoice Generator (For Email) ============= */

export function generateInvoiceHTML(order: Order): string {
  const invoiceDate = new Date(order.createdAt).toLocaleDateString();
  const itemsHTML = order.items
    .map(
      (item) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;">${item.productSlug}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${order.hsnCode || "-"}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.qty}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.price}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${order.razorpayOrderId}</title>
      <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #8E5022; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #8E5022; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .details-section { flex: 1; }
        .details-section h3 { color: #8E5022; font-size: 12px; text-transform: uppercase; margin: 0 0 10px 0; }
        .details-section p { margin: 5px 0; font-size: 13px; }
        .table-section { margin: 30px 0; }
        .table-section h3 { color: #8E5022; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background-color: #f5f5f5; border: 1px solid #ddd; padding: 10px; text-align: left; font-weight: bold; color: #333; }
        td { border: 1px solid #ddd; padding: 8px; }
        .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
        .totals-box { width: 300px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #ddd; }
        .total-row.grand-total { background-color: #f5f5f5; font-weight: bold; font-size: 16px; color: #8E5022; border-top: 2px solid #8E5022; border-bottom: 2px solid #8E5022; }
        .footer { text-align: center; font-size: 12px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        @media print { body { margin: 0; } .container { padding: 10px; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>BASHO POTTERY</h1>
          <p>Handcrafted Ceramics & Studio</p>
          <p>GSTIN: 22AAAAA0000A1Z5</p>
          <h2 style="font-size: 18px; margin: 15px 0 0 0;">TAX INVOICE</h2>
        </div>

        <div class="invoice-details">
          <div class="details-section">
            <h3>Invoice Details</h3>
            <p><strong>Invoice No:</strong> ${order.razorpayOrderId}</p>
            <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
          </div>
        </div>

        <div style="display: flex; gap: 40px; margin-bottom: 30px;">
          <div class="details-section">
            <h3>Bill To</h3>
            <p><strong>${order.customer.name}</strong></p>
            <p>${order.customer.email}</p>
            <p>${order.customer.phone}</p>
            ${order.customer.gstNumber ? `<p><strong>GSTIN:</strong> ${order.customer.gstNumber}</p>` : ""}
          </div>

          <div class="details-section">
            <h3>Ship To</h3>
            <p>${order.address.street}</p>
            <p>${order.address.city}, ${order.address.state} - ${order.address.zip}</p>
          </div>
        </div>

        <div class="table-section">
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">HSN Code</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-box">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${order.subtotal.toFixed(2)}</span>
            </div>
            ${
              order.gstAmount > 0
                ? `<div class="total-row">
              <span>Tax (18%)</span>
              <span>₹${order.gstAmount.toFixed(2)}</span>
            </div>`
                : ""
            }
            <div class="total-row grand-total">
              <span>Grand Total</span>
              <span>₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with Bashō Pottery</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
