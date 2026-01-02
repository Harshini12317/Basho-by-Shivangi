import PDFDocument from "pdfkit/js/pdfkit.standalone";

export function generateInvoicePDF(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      const buffers: Uint8Array[] = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      // ================= HEADER =================
      doc.fontSize(22).text("BASHO POTTERY", { align: "center" });
      doc.fontSize(11).text("Handcrafted Ceramics & Studio", { align: "center" });
      doc.text("GSTIN: 22AAAAA0000A1Z5", { align: "center" });

      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ================= INVOICE TITLE =================
      doc.fontSize(16).text("TAX INVOICE", { align: "center" });
      doc.moveDown(1);

      // ================= INVOICE META =================
      doc.fontSize(10);
      doc.text(`Invoice No: ${order.razorpayOrderId}`, 50);
      doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400);

      doc.moveDown(1);

      // ================= BILLING DETAILS =================
      doc.fontSize(11).text("BILL TO:", 50);
      doc.text(order.customer.name);
      doc.text(order.customer.email);
      doc.text(order.customer.phone);
      if (order.customer.gstNumber) {
        doc.text(`GSTIN: ${order.customer.gstNumber}`);
      }

      doc.moveDown(0.5);

      doc.text("SHIP TO:", 350);
      doc.text(order.address.street, 350);
      doc.text(`${order.address.city}, ${order.address.state} - ${order.address.zip}`, 350);

      doc.moveDown(1.5);

      // ================= TABLE HEADER =================
      const tableTop = doc.y;
      doc.fontSize(11);

      doc.text("Item Description", 50, tableTop);
      doc.text("Qty", 300, tableTop);
      doc.text("Rate", 360, tableTop);
      doc.text("Amount", 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // ================= ITEMS =================
      let y = tableTop + 25;

      order.items.forEach((item: any) => {
        doc.text(item.productSlug, 50, y, { width: 230 });
        doc.text(item.qty.toString(), 300, y);
        doc.text(`₹${item.price}`, 360, y);
        doc.text(`₹${(item.price * item.qty).toFixed(2)}`, 450, y);
        y += 22;
      });

      // ================= TOTALS =================
      y += 10;
      doc.moveTo(350, y).lineTo(550, y).stroke();
      y += 10;

      doc.fontSize(11);
      doc.text("Subtotal", 350, y);
      doc.text(`₹${order.subtotal.toFixed(2)}`, 450, y);

      if (order.gstAmount > 0) {
        y += 18;
        doc.text("Tax (18%)", 350, y);
        doc.text(`₹${order.gstAmount.toFixed(2)}`, 450, y);
      }

      y += 22;
      doc.fontSize(13);
      doc.text("Grand Total", 350, y);
      doc.text(`₹${order.totalAmount.toFixed(2)}`, 450, y);

      // ================= FOOTER =================
      doc.moveDown(3);
      doc.fontSize(10);
      doc.text("Thank you for shopping with Bashō Pottery.", { align: "center" });
      doc.text("This is a computer-generated invoice and does not require a signature.", {
        align: "center",
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
