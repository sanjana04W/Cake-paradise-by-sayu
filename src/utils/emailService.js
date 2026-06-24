import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const ORDER_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID;
const INQUIRY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_INQUIRY_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS
export const initEmailJS = () => {
  if (PUBLIC_KEY) {
    emailjs.init(PUBLIC_KEY);
  }
};

// Send order confirmation email
export const sendOrderConfirmation = async (orderData) => {
  if (!SERVICE_ID || !ORDER_TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping order confirmation email.');
    return null;
  }

  try {
    const itemsList = orderData.items
      .map(
        (item) =>
          `• ${item.name} (${item.weight}, ${item.flavor})${item.customText ? ` - Text: "${item.customText}"` : ''} x${item.quantity} = LKR ${item.lineTotal.toLocaleString()}`
      )
      .join('\n');

    const templateParams = {
      from_name: 'Cake Paradise',
      reply_to: 'hello@cakeparadise.lk',
      to_name: orderData.customerInfo.name,
      to_email: orderData.customerInfo.email,
      order_id: orderData.orderId,
      items_list: itemsList,
      subtotal: `LKR ${(orderData.subtotal || 0).toLocaleString()}`,
      delivery_fee: `LKR ${(orderData.deliveryFee || 0).toLocaleString()}`,
      total_amount: `LKR ${(orderData.totalAmount || 0).toLocaleString()}`,
      delivery_date: orderData.requestedDeliveryDate || 'ASAP',
      time_slot: orderData.timeSlot || 'Anytime',
      delivery_method: orderData.deliveryMethod === 'delivery' ? 'Delivery' : 'Standard',
      delivery_address: orderData.customerInfo.deliveryAddress || 'Not Provided',
      payment_method:
        orderData.paymentMethod === 'cod'
          ? 'Cash on Delivery'
          : orderData.paymentMethod === 'pickup-cash'
          ? 'Cash on Pickup'
          : orderData.paymentMethod === 'bank'
          ? 'Bank Transfer'
          : 'Credit / Debit Card',
      phone: orderData.customerInfo.phone,
      whatsapp_link: `https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '+94743593784').replace(/\D/g, '')}`,
    };

    const response = await emailjs.send(SERVICE_ID, ORDER_TEMPLATE_ID, templateParams);
    return response;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send custom inquiry acknowledgment email
export const sendInquiryAcknowledgment = async (inquiryData) => {
  if (!SERVICE_ID || !INQUIRY_TEMPLATE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping inquiry email.');
    return null;
  }

  try {
    const templateParams = {
      from_name: 'Cake Paradise',
      reply_to: 'hello@cakeparadise.lk',
      to_name: inquiryData.customerInfo.name,
      to_email: inquiryData.customerInfo.email,
      inquiry_id: inquiryData.inquiryId,
      event_type: inquiryData.eventType,
      event_date: inquiryData.eventDate,
      servings: inquiryData.targetServings,
      description: inquiryData.detailedDescription,
      budget: inquiryData.estimatedBudget,
      whatsapp_link: `https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '+94743593784').replace(/\D/g, '')}`,
    };

    const response = await emailjs.send(SERVICE_ID, INQUIRY_TEMPLATE_ID, templateParams);
    return response;
  } catch (error) {
    console.error('Error sending inquiry email:', error);
    throw error;
  }
};

// Send OTP verification code to customer email
export const sendOtpEmail = async (toEmail, toName, otp) => {
  if (!SERVICE_ID || !PUBLIC_KEY) {
    console.warn('EmailJS not configured. Skipping OTP email.');
    return null;
  }

  // Use dedicated OTP template if available, otherwise fall back to order template
  const otpTemplateId = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID || ORDER_TEMPLATE_ID;

  if (!otpTemplateId) {
    console.warn('No EmailJS template ID found. Skipping OTP email.');
    return null;
  }

  try {
    const templateParams = {
      from_name: 'Cake Paradise Security',
      reply_to: 'no-reply@cakeparadise.lk',
      to_name: toName,
      to_email: toEmail,
      otp_code: otp,
      // Provide empty fallbacks so templates that include other fields don't break
      order_id: '',
      items_list: '',
      subtotal: '',
      delivery_fee: '',
      total_amount: '',
      delivery_date: '',
      time_slot: '',
      delivery_method: '',
      delivery_address: '',
      payment_method: '',
      phone: '',
      whatsapp_link: '',
    };

    const response = await emailjs.send(SERVICE_ID, otpTemplateId, templateParams);
    return response;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send order status update email
export const sendStatusUpdateEmail = async (orderData, newStatus) => {
  if (!SERVICE_ID || !ORDER_TEMPLATE_ID || !PUBLIC_KEY) {
    return null;
  }

  const statusMessages = {
    confirmed: 'Your order has been confirmed! We are getting ready to prepare your cake.',
    processing: 'Your cake is now being prepared in our kitchen with love and care!',
    ready: 'Your cake is ready! It will be delivered/available for pickup soon.',
    dispatched: 'Your cake is on its way! Our delivery team is bringing it to you.',
    delivered: 'Your cake has been delivered! We hope you enjoy it. Thank you for choosing Cake Paradise!',
  };

  try {
    const templateParams = {
      from_name: 'Cake Paradise',
      reply_to: 'hello@cakeparadise.lk',
      to_name: orderData.customerInfo.name,
      to_email: orderData.customerInfo.email,
      order_id: orderData.orderId,
      status_message: statusMessages[newStatus] || `Your order status has been updated to: ${newStatus}`,
      new_status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1),
      whatsapp_link: `https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '+94743593784').replace(/\D/g, '')}`,
    };

    const response = await emailjs.send(SERVICE_ID, ORDER_TEMPLATE_ID, templateParams);
    return response;
  } catch (error) {
    console.error('Error sending status update email:', error);
    return null;
  }
};
