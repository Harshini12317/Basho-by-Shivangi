import nodemailer, { SendMailOptions } from "nodemailer";

/* ---------------- Types ---------------- */

interface OrderItem {
  productSlug?: string;
  name?: string;
  price: number;
  qty: number;
}

interface CustomerDetails {
  name?: string;
  phone?: string;
  gstNumber?: string;
}

interface OrderDetails {
  orderId?: string;
  amount?: number;
  items?: OrderItem[];
  customer?: CustomerDetails;
  pdfInvoice?: Buffer | string;
}

/* ---------------- Transporter ---------------- */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ---------------- Email Sender ---------------- */

export const sendPaymentSuccessEmail = async (
  customerEmail: string,
  orderDetails: OrderDetails,
  paymentId: string
) => {
  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "🎉 Payment Successful - Order Confirmed | Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #fff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✓ Payment Successful!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Your order has been confirmed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${orderDetails.customer?.name || 'Valued Customer'},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Thank you for your purchase! Your payment has been successfully processed and your order is now confirmed. We're excited to get your order to you soon!</p>

          <!-- Order Details Box -->
          <div style="background: white; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">📋 Order Details</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Order ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${orderDetails.orderId || "N/A"}</p>
              </div>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Payment ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${paymentId}</p>
              </div>
            </div>

            <!-- Items List -->
            ${
              orderDetails.items && orderDetails.items.length > 0
                ? `
              <div style="border-top: 1px solid #eee; padding-top: 15px;">
                <p style="margin: 0 0 10px 0; color: #333; font-weight: 600; font-size: 14px;">Items Ordered:</p>
                <div style="font-size: 13px;">
                  ${orderDetails.items
                    .map(
                      (item) => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                      <span style="color: #333;">${item.productSlug || item.name} <span style="color: #999;">(Qty: ${item.qty})</span></span>
                      <span style="color: #E76F51; font-weight: 600;">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              `
                : ""
            }

            <!-- Total Amount -->
            <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; font-size: 16px;">
                <span style="color: #333; font-weight: 600;">Total Amount Paid:</span>
                <span style="color: #E76F51; font-weight: 700; font-size: 18px;">₹${orderDetails.amount?.toLocaleString('en-IN') || "N/A"}</span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              <strong style="color: #333;">What's next?</strong><br>
              We'll prepare your order and send you a tracking update shortly. You can track your order anytime on our website.
            </p>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            If you have any questions, please don't hesitate to contact us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #E76F51; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Thank you for shopping with <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // Attach invoice if present
  if (orderDetails.pdfInvoice) {
    customerMailOptions.attachments = [
      {
        filename: `invoice-${orderDetails.orderId || paymentId}.pdf`,
        content: orderDetails.pdfInvoice,
        contentType: "application/pdf",
      },
    ];
    customerMailOptions.subject =
      "🎉 Payment Successful - Order Confirmed (Invoice Attached) | Basho";
  }

  const ownerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: "📦 New Order Received - Payment Successful | Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">📦 New Order Received!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Payment successfully processed</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">💳 Order & Payment Details</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Order ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${orderDetails.orderId || "N/A"}</p>
              </div>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Payment ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${paymentId}</p>
              </div>
            </div>

            <h4 style="margin: 20px 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">👤 Customer Information</h4>
            <div style="font-size: 13px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${orderDetails.customer?.name || "N/A"}</p>
              <p style="margin: 8px 0;"><strong>Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> ${orderDetails.customer?.phone || "N/A"}</p>
              ${
                orderDetails.customer?.gstNumber
                  ? `<p style="margin: 8px 0;"><strong>GST Number:</strong> ${orderDetails.customer.gstNumber}</p>`
                  : ""
              }
            </div>

            <!-- Items List -->
            ${
              orderDetails.items && orderDetails.items.length > 0
                ? `
              <h4 style="margin: 20px 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">📝 Items Ordered</h4>
              <div style="border-top: 1px solid #eee; padding-top: 10px;">
                <div style="font-size: 13px;">
                  ${orderDetails.items
                    .map(
                      (item) => `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                      <span style="color: #333;">${item.productSlug || item.name} <span style="color: #999;">(Qty: ${item.qty})</span></span>
                      <span style="color: #E76F51; font-weight: 600;">₹${(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  `
                    )
                    .join("")}
                </div>
              </div>
              `
                : ""
            }

            <!-- Total Amount -->
            <div style="border-top: 2px solid #eee; margin-top: 15px; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; font-size: 16px;">
                <span style="color: #333; font-weight: 600;">Total Amount:</span>
                <span style="color: #E76F51; font-weight: 700; font-size: 18px;">₹${orderDetails.amount?.toLocaleString('en-IN') || "N/A"}</span>
              </div>
            </div>
          </div>

          <!-- Action Required -->
          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #666;">
              <strong style="color: #333;">⚡ Action Required:</strong><br>
              Please process this order and update the status in the admin dashboard. The customer will be notified about tracking updates.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Order placed at ${new Date().toLocaleString('en-IN')}</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(ownerMailOptions);
    console.log("Emails sent successfully");
  } catch (error) {
    console.error("Error sending emails:", error);
    throw error;
  }
};

/* ========== Workshop Registration Email ========== */

export const sendWorkshopRegistrationEmail = async (
  customerEmail: string,
  customerName: string,
  workshopTitle: string
) => {
  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `✅ Workshop Registration Confirmed - ${workshopTitle} | Basho`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8E5022 0%, #6B3D1A 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✅ Registration Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">You're all set for the workshop</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Congratulations! Your registration for the workshop has been successfully confirmed. We're thrilled to have you join us for an amazing learning experience!</p>

          <!-- Workshop Details Box -->
          <div style="background: white; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #8E5022;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">📚 Workshop Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Workshop:</strong> ${workshopTitle}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Registration Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <!-- Important Info -->
          <div style="background: #f8f3ed; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #8E5022;">
            <p style="margin: 0; font-size: 13px; color: #5c4033;">
              <strong style="color: #333;">📋 What's Next?</strong><br>
              We'll send you an email soon with all the details you need to know about the workshop, including date, time, location, and what to bring.
            </p>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            If you have any questions, feel free to reach out to us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #8E5022; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Thank you for choosing <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const adminMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: `📚 New Workshop Registration - ${workshopTitle} | Basho`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8E5022 0%, #6B3D1A 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">📚 New Workshop Registration</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Someone just registered for your workshop</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #8E5022;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">✏️ Registration Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Workshop:</strong> ${workshopTitle}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Participant Name:</strong> ${customerName}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Email:</strong> ${customerEmail}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Registration Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style="background: #f8f3ed; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #8E5022;">
            <p style="margin: 0; font-size: 13px; color: #5c4033;">
              <strong style="color: #333;">⚡ Action Required:</strong><br>
              Check your admin dashboard to view all registrations and send workshop details to the participant.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Basho Admin Notification</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log(`Sending customer email to ${customerEmail}`);
    await transporter.sendMail(customerMailOptions);
    console.log(`Customer email sent to ${customerEmail}`);
    
    console.log(`Sending admin email to ${process.env.OWNER_EMAIL}`);
    await transporter.sendMail(adminMailOptions);
    console.log(`Admin email sent to ${process.env.OWNER_EMAIL}`);
    
    console.log("Workshop registration emails sent successfully");
  } catch (error) {
    console.error("Error sending workshop registration emails:", error);
    throw error;
  }
};

/* ========== Event Booking Email ========== */

export const sendEventBookingEmail = async (
  customerName: string,
  customerEmail: string | undefined,
  eventTitle: string,
  bookingDate: string
) => {
  // Only send email if we have a valid email address
  if (!customerEmail || !customerEmail.includes('@')) {
    console.log("Skipping email - no valid customer email for event booking");
    return;
  }

  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: `✅ Event Booking Confirmed - ${eventTitle} | Basho`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">✅ Booking Confirmed!</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Your spot is reserved</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Great! Your booking for the event has been confirmed. We're looking forward to seeing you there. This is going to be an amazing experience!</p>

          <!-- Event Details Box -->
          <div style="background: white; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">🎉 Event Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Event:</strong> ${eventTitle}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Booking Date:</strong> ${new Date(bookingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Registration Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <!-- Important Info -->
          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423;">
              <strong style="color: #333;">📌 Important:</strong><br>
              Your booking is pending confirmation. We'll send you a confirmation email with all the details (time, venue, instructions) shortly.
            </p>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            Any questions? Contact us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #E76F51; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">See you at the event! – <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const adminMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: `🎉 New Event Booking - ${eventTitle} | Basho`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">🎉 New Event Booking</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Someone just booked your event</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">✏️ Booking Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Event:</strong> ${eventTitle}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Guest Name:</strong> ${customerName}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Email:</strong> ${customerEmail}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Booking Date:</strong> ${new Date(bookingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Booking Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423;">
              <strong style="color: #333;">⚡ Action Required:</strong><br>
              Review this booking in your admin dashboard and confirm/update the status to notify the guest.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Basho Admin Notification</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log("Event booking emails sent successfully");
  } catch (error) {
    console.error("Error sending event booking emails:", error);
    throw error;
  }
};

/* ========== Custom Order Request Email ========== */

export const sendCustomOrderRequestEmail = async (
  customerName: string,
  customerEmail: string,
  description: string,
  orderId: string
) => {
  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Custom Order Request Received - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Custom Order Request Received</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">We've received your custom order inquiry</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Thank you for your custom order inquiry! We have successfully received your request and our team will review all the details you provided. We'll get back to you shortly with a personalized quote.</p>

          <!-- Order Details Box -->
          <div style="background: white; padding: 20px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Your Order Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Order ID:</strong> ${orderId}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Request Date:</strong> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Description:</strong></p>
              <p style="margin: 5px 0 10px 0; color: #555; padding: 10px; background: #f5f5f5; border-radius: 4px;">${description}</p>
            </div>
          </div>

          <!-- What to Expect -->
          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423; line-height: 1.6;">
              <strong style="color: #333;">What happens next?</strong><br>
              Our team will carefully review your requirements and any reference images you've provided. We'll prepare a personalized quote based on the complexity and materials needed. You can expect to hear from us within 2-3 business days.
            </p>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            If you have any additional details to add or questions, feel free to contact us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #E76F51; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Thank you for choosing <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const adminMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: "New Custom Order Request - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">New Custom Order Request</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">A customer has submitted a custom order inquiry</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Customer Information</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 8px 0;"><strong style="color: #333;">Name:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Order ID:</strong> ${orderId}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Received Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>

            <h3 style="margin: 20px 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Order Description</h3>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 14px; color: #555; line-height: 1.6;">
              ${description}
            </div>
          </div>

          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423;">
              <strong style="color: #333;">Action Required:</strong><br>
              Review this custom order request in your admin dashboard. When ready, provide a quote and the customer will be notified automatically.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Basho Admin Notification</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log("Custom order request emails sent successfully");
  } catch (error) {
    console.error("Error sending custom order request emails:", error);
    throw error;
  }
};

/* ========== Custom Order Quote Email ========== */

export const sendCustomOrderQuoteEmail = async (
  customerName: string,
  customerEmail: string,
  description: string,
  quotedPrice: number,
  orderId: string
) => {
  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Your Custom Order Quote - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Your Quote is Ready</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">We've prepared a personalized quote for your custom order</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Great news! Our team has reviewed your custom order request and prepared a detailed quote for you. Below you'll find the pricing for your custom creation.</p>

          <!-- Quote Details Box -->
          <div style="background: white; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 16px; font-weight: 600;">Quote Details</h3>
            
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><strong style="color: #333;">Order ID:</strong> ${orderId}</p>
              <p style="margin: 10px 0;"><strong style="color: #333;">Project Description:</strong></p>
              <p style="margin: 5px 0 10px 0; color: #555; padding: 10px; background: #f5f5f5; border-radius: 4px;">${description}</p>
            </div>

            <!-- Price Box -->
            <div style="background: linear-gradient(135deg, #fff8f3 0%, #ffe8d6 100%); padding: 20px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Quoted Price</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; color: #E76F51; font-weight: 700;">₹${quotedPrice.toLocaleString('en-IN')}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Inclusive of all materials and craftsmanship</p>
            </div>
          </div>

          <!-- Next Steps -->
          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423; line-height: 1.6;">
              <strong style="color: #333;">What's next?</strong><br>
              If you're happy with the quote, you can proceed to payment through our website. Once payment is confirmed, we'll begin creating your custom piece and keep you updated on the progress. If you have any questions about the quote, please don't hesitate to reach out.
            </p>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            Questions about this quote? Contact us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #E76F51; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Thank you for choosing <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const adminMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: "Custom Order Quoted - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Quote Sent to Customer</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">You've sent a quote for a custom order</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Quote Summary</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 8px 0;"><strong style="color: #333;">Customer Name:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Customer Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Order ID:</strong> ${orderId}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Quoted Price:</strong> <span style="font-size: 16px; color: #E76F51; font-weight: 700;">₹${quotedPrice.toLocaleString('en-IN')}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Quote Sent At:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>

            <h4 style="margin: 20px 0 10px 0; color: #333; font-size: 14px; font-weight: 600;">Project Description</h4>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 13px; color: #555; line-height: 1.6;">
              ${description}
            </div>
          </div>

          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423;">
              <strong style="color: #333;">Note:</strong> The customer has been notified of the quote. Check your admin dashboard to track payment status and order progress.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Basho Admin Notification</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log("Custom order quote emails sent successfully");
  } catch (error) {
    console.error("Error sending custom order quote emails:", error);
    throw error;
  }
};

/* ========== Custom Order Payment Email ========== */

export const sendCustomOrderPaymentEmail = async (
  customerName: string,
  customerEmail: string,
  quotedPrice: number,
  orderId: string,
  paymentId: string
) => {
  const customerMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: customerEmail,
    subject: "Payment Received - Custom Order Confirmed - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Successful</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Your custom order is confirmed and in progress</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Dear ${customerName},</p>
          
          <p style="margin: 0 0 20px 0; font-size: 14px; color: #666; line-height: 1.6;">Thank you for your payment! We're thrilled to confirm that your custom order is now paid in full and we're beginning work on your creation. We'll keep you updated on the progress and notify you when your piece is ready.</p>

          <!-- Payment Details Box -->
          <div style="background: white; padding: 25px; margin: 25px 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 16px; font-weight: 600;">Payment Confirmation</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 15px;">
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Order ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${orderId}</p>
              </div>
              <div>
                <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Payment ID</p>
                <p style="margin: 5px 0 0 0; color: #333; font-weight: 600; font-size: 15px;">${paymentId}</p>
              </div>
            </div>

            <!-- Amount Box -->
            <div style="background: linear-gradient(135deg, #fff8f3 0%, #ffe8d6 100%); padding: 20px; border-radius: 6px; margin-top: 20px;">
              <p style="margin: 0; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
              <p style="margin: 10px 0 0 0; font-size: 32px; color: #E76F51; font-weight: 700;">₹${quotedPrice.toLocaleString('en-IN')}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Payment Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <!-- Timeline -->
          <div style="background: #fff8f3; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #333; font-weight: 600;">What Happens Now?</p>
            <div style="font-size: 13px; color: #666; line-height: 1.8;">
              <p style="margin: 8px 0;"><strong>1. Production Starts</strong> - Our artisans will begin crafting your custom piece</p>
              <p style="margin: 8px 0;"><strong>2. Progress Updates</strong> - We'll send you updates as your order progresses</p>
              <p style="margin: 8px 0;"><strong>3. Quality Check</strong> - Your piece will undergo careful quality inspection</p>
              <p style="margin: 8px 0;"><strong>4. Ready for Delivery</strong> - We'll notify you when it's complete and ready to ship</p>
            </div>
          </div>

          <!-- Contact -->
          <p style="margin: 20px 0 0 0; font-size: 13px; color: #999;">
            If you have any questions, reach out to us at 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #E76F51; text-decoration: none;">${process.env.EMAIL_USER}</a>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Thank you for choosing <strong>Basho</strong></p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  const adminMailOptions: SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.OWNER_EMAIL,
    subject: "Custom Order Payment Received - Basho",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E76F51 0%, #D35400 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Payment Received</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.95;">Customer has paid for custom order</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; margin: 0; border-radius: 8px; border-left: 4px solid #E76F51;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">Payment & Order Details</h3>
            
            <div style="font-size: 14px; color: #666;">
              <p style="margin: 8px 0;"><strong style="color: #333;">Customer Name:</strong> ${customerName}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Customer Email:</strong> ${customerEmail}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Order ID:</strong> ${orderId}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Payment ID:</strong> ${paymentId}</p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Amount Paid:</strong> <span style="font-size: 16px; color: #E76F51; font-weight: 700;">₹${quotedPrice.toLocaleString('en-IN')}</span></p>
              <p style="margin: 8px 0;"><strong style="color: #333;">Payment Date & Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div style="background: #fff8f3; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 3px solid #E76F51;">
            <p style="margin: 0; font-size: 13px; color: #6a4423;">
              <strong style="color: #333;">Action Required:</strong><br>
              The custom order is now ready for production. Update the order status to 'in-progress' in your admin dashboard and begin work on creating this custom piece. The customer will be notified of any updates.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #999;">
          <p style="margin: 0;">Basho Admin Notification</p>
          <p style="margin: 5px 0 0 0;">© 2026 Basho. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(customerMailOptions);
    await transporter.sendMail(adminMailOptions);
    console.log("Custom order payment emails sent successfully");
  } catch (error) {
    console.error("Error sending custom order payment emails:", error);
    throw error;
  }
};
