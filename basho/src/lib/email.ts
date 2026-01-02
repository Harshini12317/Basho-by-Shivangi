import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPaymentSuccessEmail = async (
  customerEmail: string,
  orderDetails: any,
  paymentId: string
) => {
  const customerMailOptions: any = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: 'Payment Successful - Order Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Successful!</h2>
        <p>Dear Customer,</p>
        <p>Your payment has been successfully processed and your order has been confirmed.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Order ID:</strong> ${orderDetails.orderId || 'N/A'}</p>
          <p><strong>Amount:</strong> ₹${orderDetails.amount || 'N/A'}</p>
          ${orderDetails.items ? `
            <h4>Items:</h4>
            <ul>
              ${orderDetails.items.map((item: any) => `<li>${item.productSlug || item.name} - ₹${item.price} (Qty: ${item.qty})</li>`).join('')}
            </ul>
          ` : ''}
        </div>

        <p>Thank you for shopping with Basho!</p>
        <p>Best regards,<br>Basho Team</p>
      </div>
    `,
  };

  // Add PDF attachment if provided
  if (orderDetails.pdfInvoice) {
    customerMailOptions.attachments = [{
      filename: `invoice-${orderDetails.orderId || paymentId}.pdf`,
      content: orderDetails.pdfInvoice,
      contentType: 'application/pdf'
    }];
    customerMailOptions.subject = 'Payment Successful - Order Confirmed (Invoice Attached)';
  }

  const ownerMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: 'New Order Received - Payment Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Order Received!</h2>
        <p>A new order has been placed and payment has been successfully processed.</p>

        <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3>Order Details:</h3>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Order ID:</strong> ${orderDetails.orderId || 'N/A'}</p>
          <p><strong>Customer Email:</strong> ${customerEmail}</p>
          <p><strong>Amount:</strong> ₹${orderDetails.amount || 'N/A'}</p>
          ${orderDetails.items ? `
            <h4>Items:</h4>
            <ul>
              ${orderDetails.items.map((item: any) => `<li>${item.productSlug || item.name} - ₹${item.price} (Qty: ${item.qty})</li>`).join('')}
            </ul>
          ` : ''}
          ${orderDetails.customer ? `
            <h4>Customer Details:</h4>
            <p><strong>Name:</strong> ${orderDetails.customer.name || 'N/A'}</p>
            <p><strong>Phone:</strong> ${orderDetails.customer.phone || 'N/A'}</p>
            <p><strong>GST Number:</strong> ${orderDetails.customer.gstNumber || 'N/A'}</p>
          ` : ''}
        </div>

        <p>Please process this order accordingly.</p>
        <p>Best regards,<br>Basho System</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(ownerMailOptions);
    console.log('Emails sent successfully');
  } catch (error) {
    console.error('Error sending emails:', error);
    throw error;
  }
};