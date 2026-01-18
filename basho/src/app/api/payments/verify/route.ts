import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendPaymentSuccessEmail } from '@/lib/email';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import StaticData from '@/models/StaticData';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateInvoicePDF, generateInvoiceHTML } from '@/lib/invoice-pdf';
import { validateGST } from '@/lib/gst-validation';

// Helper function to handle background tasks without blocking response
function scheduleBackgroundTask(fn: () => Promise<void>) {
  // Use setImmediate to run after the response is sent
  setImmediate(() => {
    fn().catch(err => console.error('Background task failed:', err));
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = await request.json();

    // Verify payment signature (this is critical and must complete)
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified successfully
      console.log('Payment verified:', {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        orderDetails
      });

      // Save workshop registration if applicable
      if (orderDetails.workshop) {
        try {
          await connectDB();
          const Registration = (await import('@/models/Registration')).default;
          const registration = new Registration({
            workshopTitle: orderDetails.workshop,
            name: orderDetails.customer.name,
            email: orderDetails.customer.email,
            phone: orderDetails.customer.phone,
            members: orderDetails.members,
            requests: orderDetails.requests,
            level: orderDetails.level,
            date: orderDetails.date,
            timeSlot: orderDetails.timeSlot,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            amount: orderDetails.totalAmount,
          });
          await registration.save();
          console.log('Registration saved:', registration._id);

          // Schedule email sending as background task
          scheduleBackgroundTask(async () => {
            try {
              await sendPaymentSuccessEmail(
                orderDetails.customer.email,
                {
                  orderId: razorpay_order_id,
                  amount: orderDetails.totalAmount,
                  items: [{
                    name: orderDetails.workshop,
                    price: orderDetails.totalAmount,
                    qty: orderDetails.members,
                  }],
                },
                razorpay_payment_id
              );
              console.log('Workshop registration email sent successfully');
            } catch (emailError) {
              console.error('Error sending registration email:', emailError);
            }
          });

          // Return success immediately without waiting for email
          return NextResponse.json(
            { success: true, message: 'Workshop registration completed successfully' },
            { status: 200 }
          );
        } catch (regError) {
          console.error('Error saving registration:', regError);
          return NextResponse.json(
            { success: false, error: 'Failed to save workshop registration' },
            { status: 500 }
          );
        }
      }

      // Get user session to save order
      const session = await getServerSession(authOptions);
      let userId = null;
      if (session?.user?.email) {
        await connectDB();
        const User = (await import('@/models/User')).default;
        const user = await User.findOne({ email: session.user.email });
        userId = user?._id;
      }

      // Save order to database if user is logged in
      if (userId) {
        try {
          await connectDB();

          // Handle different order types
          if (orderDetails.type === 'custom-order') {
            // Update custom order status
            const CustomOrder = (await import('@/models/CustomOrder')).default;
            await CustomOrder.findByIdAndUpdate(orderDetails.customOrderId, {
              status: 'paid',
              paymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              paidAt: new Date(),
            });
            console.log('Custom order payment verified:', orderDetails.customOrderId);
          } else {
            // Handle regular product orders
            const order = new Order({
              userId,
              items: orderDetails.items,
              totalAmount: orderDetails.totalAmount,
              subtotal: orderDetails.subtotal,
              shippingAmount: orderDetails.shippingAmount,
              gstAmount: orderDetails.gstAmount,
              paymentId: razorpay_payment_id,
              razorpayOrderId: razorpay_order_id,
              customer: orderDetails.customer,
              address: orderDetails.address,
            });
            await order.save();
            console.log('Order saved:', order._id);

            // Schedule PDF generation and email sending as background task
            scheduleBackgroundTask(async () => {
              try {
                // Generate and send invoice if GST is provided and valid
                const gstNumber = orderDetails.customer.gstNumber?.trim();
                const isGSTValid = gstNumber && validateGST(gstNumber);

                console.log('📋 Payment Success - Processing email:', {
                  email: orderDetails.customer.email,
                  gstNumber: gstNumber || 'none',
                  isGSTValid,
                  orderId: razorpay_order_id,
                });

                if (isGSTValid) {
                  try {
                    // Fetch HSN code from static data
                    const staticData = await StaticData.findOne();
                    const hsnCode = staticData?.hsnCode || '';

                    console.log('🔍 Generating PDF invoice with HSN:', hsnCode);

                    // Generate PDF invoice for email
                    const pdfBuffer = await generateInvoicePDF({
                      razorpayOrderId: razorpay_order_id,
                      createdAt: new Date().toISOString(),
                      customer: orderDetails.customer,
                      address: orderDetails.address,
                      items: orderDetails.items,
                      subtotal: orderDetails.subtotal,
                      gstAmount: orderDetails.gstAmount,
                      totalAmount: orderDetails.totalAmount,
                      hsnCode,
                    });

                    console.log('✅ PDF invoice generated successfully, sending email');

                    // Send invoice email with PDF invoice
                    await sendPaymentSuccessEmail(
                      orderDetails.customer.email,
                      {
                        ...orderDetails,
                        orderId: razorpay_order_id,
                        amount: orderDetails.totalAmount,
                        pdfInvoice: pdfBuffer, // Send PDF for attachment
                      },
                      razorpay_payment_id
                    );

                    console.log('✅ Invoice email sent successfully');
                  } catch (invoiceError) {
                    console.error('❌ Error generating/sending invoice:', invoiceError);
                    // Send regular email if invoice generation fails
                    await sendPaymentSuccessEmail(
                      orderDetails.customer.email,
                      {
                        ...orderDetails,
                        orderId: razorpay_order_id,
                        amount: orderDetails.totalAmount
                      },
                      razorpay_payment_id
                    );
                    console.log('✅ Confirmation email sent without invoice');
                  }
                } else {
                  // Send regular confirmation email
                  console.log('📧 Sending regular confirmation email (no GST)');
                  await sendPaymentSuccessEmail(
                    orderDetails.customer.email,
                    {
                      ...orderDetails,
                      orderId: razorpay_order_id,
                      amount: orderDetails.totalAmount
                    },
                    razorpay_payment_id
                  );
                }
              } catch (error) {
                console.error('Error in background email/PDF task:', error);
              }
            });
          }
        } catch (error) {
          console.error('Error saving order:', error);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: razorpay_payment_id
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}