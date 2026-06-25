import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, Lock, Banknote, X, Mail, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { createOrder } from '../../firebase/firestore';
import { uploadImage } from '../../firebase/storage';
import { sendOrderConfirmation, sendOtpEmail } from '../../utils/emailService';

// ─── Helpers ───────────────────────────────────────────────────────────────
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const OTP_EXPIRY_SECONDS = 300; // 5 minutes

// ─── OTP Input Component ──────────────────────────────────────────────────
const OtpInput = ({ value, onChange }) => {
  const inputsRef = useRef([]);
  // Create exactly 6 elements, filled with the characters of value or empty strings
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      // If there's a value, delete it. If it's already empty, move to the previous input and delete that.
      if (digits[idx]) {
        newDigits[idx] = '';
        onChange(newDigits.join(''));
      } else if (idx > 0) {
        newDigits[idx - 1] = '';
        onChange(newDigits.join(''));
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleInput = (e, idx) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    if (!char) return; // ignore non-digits
    
    const newDigits = [...digits];
    newDigits[idx] = char;
    onChange(newDigits.join(''));
    
    if (idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputsRef.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={el => (inputsRef.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1} // We manage selection ourselves, but to prevent weird mobile behavior we keep this 1. Actually if it's 1, e.target.value might be weird if trying to replace.
          value={digits[idx]}
          onChange={e => handleInput(e, idx)}
          onKeyDown={e => handleKey(e, idx)}
          className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold focus:border-rose-gold transition-all text-dark-chocolate bg-white"
          style={{ borderColor: digits[idx] ? '#B76E79' : '#e5d5c5' }}
        />
      ))}
    </div>
  );
};

// ─── Countdown timer ─────────────────────────────────────────────────────
const useCountdown = (seconds, resetTrigger) => {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
    const id = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds, resetTrigger]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, display: `${mm}:${ss}` };
};

// ─── Main Checkout Component ──────────────────────────────────────────────
const Checkout = () => {
  const { items, getSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const subtotal = getSubtotal();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Sri Lanka',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    paymentMethod: 'card',
  });

  // OTP state
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'placing'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSentAt, setOtpSentAt] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const { remaining: timeLeft, display: timeDisplay } = useCountdown(otpSentAt ? OTP_EXPIRY_SECONDS : 0, otpSentAt);

  // Redirect if cart is empty
  React.useEffect(() => {
    if (loading) return;
    if (items.length === 0) navigate('/cart');
    else if (!user) navigate('/login?redirect=/checkout');
  }, [items, user, loading, navigate]);

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Pre-fill form from user profile
  React.useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  const handleFileChange = e => {
    if (e.target.files?.[0]) setReceiptFile(e.target.files[0]);
  };

  // ── Step 1: Validate form & send OTP ─────────────────────────────────
  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    if (formData.paymentMethod === 'bank' && !receiptFile) {
      alert('Please upload your bank payment receipt.');
      return;
    }

    if (!formData.email) {
      alert('Please enter your email address to receive the OTP.');
      return;
    }

    setIsSendingOtp(true);
    const otp = generateOtp();
    setGeneratedOtp(otp);

    try {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim() || 'Customer';
      await sendOtpEmail(formData.email, customerName, otp);
      setOtpSentAt(Date.now());
      setStep('otp');
      setEnteredOtp('');
      setOtpError('');
    } catch (err) {
      // If EmailJS is not configured, allow dev/demo mode with a fallback
      if (err?.message?.includes('not configured') || !import.meta.env.VITE_EMAILJS_SERVICE_ID) {
        console.warn('EmailJS not configured — showing OTP in console for demo:', otp);
        alert(`[DEMO MODE] Your OTP is: ${otp}\n\n(In production, this will be emailed to ${formData.email})`);
        setOtpSentAt(Date.now());
        setStep('otp');
        setEnteredOtp('');
        setOtpError('');
      } else {
        alert('Failed to send OTP. Please check your email address and try again.');
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setIsSendingOtp(true);
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setOtpError('');
    try {
      const customerName = `${formData.firstName} ${formData.lastName}`.trim() || 'Customer';
      await sendOtpEmail(formData.email, customerName, otp);
      setOtpSentAt(Date.now());
    } catch {
      console.warn('Resend failed — new OTP for demo:', otp);
      alert(`[DEMO MODE] Your new OTP is: ${otp}`);
      setOtpSentAt(Date.now());
    } finally {
      setIsSendingOtp(false);
    }
  };

  // ── Step 2: Verify OTP & Place Order ─────────────────────────────────
  const handlePlaceOrder = async () => {
    if (enteredOtp.length !== 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    if (timeLeft === 0) {
      setOtpError('OTP has expired. Please request a new one.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError('Incorrect OTP. Please try again.');
      setEnteredOtp('');
      return;
    }

    setOtpError('');
    setIsPlacing(true);

    try {
      let receiptUrl = null;

      const processOrder = async () => {
        if (formData.paymentMethod === 'bank' && receiptFile) {
          const uploadResult = await uploadImage(receiptFile, 'receipts');
          receiptUrl = uploadResult.url;
        }

        const orderData = {
          customerInfo: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            deliveryAddress: `${formData.address}${formData.apartment ? ', ' + formData.apartment : ''}, ${formData.city}, ${formData.state}, ${formData.postalCode}, ${formData.country}`,
          },
          items,
          subtotal,
          totalAmount: subtotal,
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData.paymentMethod === 'bank' ? { receiptUrl } : {},
        };

        const cleanOrderData = JSON.parse(JSON.stringify(orderData));
        await createOrder(cleanOrderData);
        sendOrderConfirmation(cleanOrderData); // fire-and-forget
      };

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Firebase connection timeout')), 8000)
      );

      try {
        await Promise.race([processOrder(), timeoutPromise]);
      } catch (err) {
        if (err.message === 'Firebase connection timeout') {
          console.warn('Order saved locally (Firebase timeout).');
        } else {
          throw err;
        }
      }

      clearCart();
      navigate('/order-success');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────
  return (
    <>
      <Helmet>
        <title>Checkout | Cake Paradise by Sayu</title>
      </Helmet>

      <div className="bg-champagne pt-32 pb-8">
        <div className="container mx-auto px-4 md:px-8">
          {step === 'form' ? (
            <Link to="/cart" className="inline-flex items-center text-sm font-medium text-dark-chocolate hover:text-rose-gold transition-colors mb-4">
              <ChevronLeft size={16} className="mr-1" /> Back to Cart
            </Link>
          ) : (
            <button onClick={() => setStep('form')} className="inline-flex items-center text-sm font-medium text-dark-chocolate hover:text-rose-gold transition-colors mb-4">
              <ChevronLeft size={16} className="mr-1" /> Back to Order Details
            </button>
          )}
          <h1 className="text-3xl font-display font-bold text-dark-chocolate">Checkout</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* ── OTP VERIFICATION SCREEN ── */}
        {step === 'otp' && (
          <div className="max-w-md mx-auto">
            <div className="bg-champagne-light rounded-3xl p-8 md:p-10 shadow-sm border border-champagne text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-gold/10 rounded-full mb-6">
                <Mail size={40} className="text-rose-gold" />
              </div>

              <h2 className="text-2xl font-display font-bold text-dark-chocolate mb-2">Check Your Email</h2>
              <p className="text-charcoal/70 text-sm leading-relaxed mb-2">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-dark-chocolate mb-6">{formData.email}</p>

              {/* OTP Inputs */}
              <div className="mb-4">
                <OtpInput value={enteredOtp} onChange={v => { setEnteredOtp(v); setOtpError(''); }} />
              </div>

              {/* Error */}
              {otpError && (
                <p className="text-red-500 text-sm mb-4 flex items-center justify-center gap-1.5">
                  <span>⚠</span> {otpError}
                </p>
              )}

              {/* Timer */}
              <p className={`text-sm mb-6 ${timeLeft < 60 ? 'text-red-500 font-semibold' : 'text-charcoal/50'}`}>
                {timeLeft > 0 ? `Code expires in ${timeDisplay}` : 'Code has expired'}
              </p>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacing || enteredOtp.length < 6}
                className={`w-full py-4 rounded-full font-bold text-lg text-white transition-all shadow-md flex items-center justify-center gap-2 mb-4 ${
                  isPlacing || enteredOtp.length < 6
                    ? 'bg-rose-gold/50 cursor-not-allowed'
                    : 'bg-rose-gold hover:bg-deep-burgundy hover:shadow-lg transform hover:-translate-y-1'
                }`}
              >
                {isPlacing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Verify & Place Order • LKR {subtotal.toLocaleString()}
                  </>
                )}
              </button>

              {/* Resend */}
              <button
                onClick={handleResendOtp}
                disabled={isSendingOtp || (timeLeft > OTP_EXPIRY_SECONDS - 30)}
                className="text-sm text-rose-gold hover:text-dark-chocolate transition-colors flex items-center justify-center gap-1 mx-auto disabled:opacity-40"
              >
                <RefreshCw size={14} className={isSendingOtp ? 'animate-spin' : ''} />
                {isSendingOtp ? 'Sending…' : 'Resend Code'}
              </button>
            </div>

            {/* Order summary mini card */}
            <div className="mt-6 bg-cream/40 rounded-2xl p-5 border border-cream text-sm">
              <h3 className="font-display font-bold text-dark-chocolate mb-3">Order Summary</h3>
              {items.map(item => (
                <div key={item.itemKey} className="flex justify-between text-charcoal mb-1">
                  <span>{item.quantity}× {item.name}</span>
                  <span className="font-medium">LKR {item.lineTotal.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-cream/80 mt-3 pt-3 flex justify-between font-bold text-dark-chocolate">
                <span>Total</span>
                <span className="text-rose-gold">LKR {subtotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT FORM ── */}
        {step === 'form' && (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Form */}
            <div className="lg:w-2/3">
              <div className="bg-champagne-light rounded-3xl p-6 md:p-10 shadow-sm border border-champagne">
                <form onSubmit={handleConfirmOrder}>
                  <h2 className="text-xl font-display font-bold text-dark-chocolate mb-6 pb-2 border-b border-cream">Contact Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">First Name *</label>
                      <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Last Name *</label>
                      <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Email Address *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                      <p className="text-xs text-charcoal/50 mt-1">OTP verification code will be sent here</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Phone Number *</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                    </div>
                  </div>

                  <h2 className="text-xl font-display font-bold text-dark-chocolate mb-6 pb-2 border-b border-cream mt-10">Delivery Details</h2>
                  <div className="space-y-6 mb-8">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Country / Region *</label>
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 appearance-none">
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">Street Address *</label>
                      <input required type="text" name="address" placeholder="House number and street name" value={formData.address} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50 mb-4" />
                      <input type="text" name="apartment" placeholder="Apartment, suite, unit, etc. (optional)" value={formData.apartment} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">City *</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">State / Province *</label>
                        <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-charcoal mb-2">Postal Code *</label>
                        <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <h2 className="text-xl font-display font-bold text-dark-chocolate mb-6 pb-2 border-b border-cream mt-10">Payment Method</h2>
                  <div className="space-y-4 mb-8">
                    <div className="flex flex-col space-y-3">
                      {/* Credit / Debit Card */}
                      <label className={`border rounded-xl p-4 flex items-center cursor-pointer transition-colors ${formData.paymentMethod === 'card' ? 'border-rose-gold bg-rose-gold/5' : 'border-cream bg-cream/10'}`}>
                        <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleChange} className="mr-3 text-rose-gold focus:ring-rose-gold" />
                        <span className="font-medium text-dark-chocolate flex-grow">Credit / Debit Card</span>
                        <div className="flex space-x-2">
                          <div className="bg-white px-2 py-1 rounded border border-gray-200 flex items-center justify-center">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAfCAMAAACF8f6iAAAAdVBMVEX///8UNMsAJMkAKspca9YALMoAJskAD8cIL8oAIMgAHcioreYAFMextumiqOUAAMaMlN9GV9G+wuxLXNLv8Pp7hdxlctf6+/7Cxu3f4fbm6PiVnOLO0fHV1/PZ3PSco+RWZtU5TdCBit0tRM5vetkfOswnP839FUl8AAAB00lEQVQ4je1TW4KDIAwkIIKIj/q2rda27t7/iJsE63KE/dj5aIlJJiQThPjHn8KjbbcEkQfzjkY7ihZ/ZzS7R+uMf/YLO+chSbbikzlOQ6W1ria2EqnlIGajtSFWk1oAsL5kp1RayySqelUAqqZT5wH8IgoJ9iLEDS0rM6n8Ss4iQxJQ8X1rBbbli6dgn0L0ioi6CkBfiql4GY56UnXw1yjx7vADHdCRYRNvC1nDFexv0Oopjxy/GH1gmpAgPc2HxLD7GbQrJJVHTx+0XEJsGtI6XEAjDZXwfRdCsH27jebo6RQlhfTGTfmOLT3g10tKwzCPTwhyf2GFOHFxSCduR8KgQbIAiad5uI3OOHk30n39HGc6mrNlLQT9u9Db9E0SONyOxoHqBQklizgxwSI5qvcmWbG3ajwcJVJSWxcLab6uNJ0+TsQkOLQQTRYIAlBTlHamQaXOYVjkQ8xBJElnXAdibXhdSHa1U/qJ8zYMzevEGuGtqI/WfO2vXWHDZiFlrSHIs/8DO1F61swATw5DtCI+/xJlWF4RplPGiYWR0vHmL5WUuJzXKsPHoJWj6lkmTXh4c3WEfdCVeV6yQiueaEZdU+/JXtNzu5Lz2CA85uIffws/lusXjWNFJpAAAAAASUVORK5CYII=" alt="Visa" className="h-3" />
                          </div>
                          <div className="bg-white px-2 py-1 rounded border border-gray-200 flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-3" />
                          </div>
                        </div>
                      </label>

                      {/* Bank */}
                      <label className={`border rounded-xl p-4 flex items-center cursor-pointer transition-colors ${formData.paymentMethod === 'bank' ? 'border-rose-gold bg-rose-gold/5' : 'border-cream bg-cream/10'}`}>
                        <input type="radio" name="paymentMethod" value="bank" checked={formData.paymentMethod === 'bank'} onChange={handleChange} className="mr-3 text-rose-gold focus:ring-rose-gold" />
                        <span className="font-medium text-dark-chocolate">Direct Bank Payment</span>
                      </label>

                      {/* COD */}
                      <label className={`border rounded-xl p-4 flex items-center cursor-pointer transition-colors ${formData.paymentMethod === 'cod' ? 'border-rose-gold bg-rose-gold/5' : 'border-cream bg-cream/10'}`}>
                        <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} className="mr-3 text-rose-gold focus:ring-rose-gold" />
                        <span className="font-medium text-dark-chocolate">Cash on Delivery</span>
                      </label>
                    </div>

                    {/* Card details */}
                    {formData.paymentMethod === 'card' && (
                      <div className="bg-cream/20 border border-cream rounded-xl p-6 mt-4">
                        <div className="flex items-center space-x-2 mb-4 text-charcoal/80 text-sm">
                          <Lock size={16} className="text-rose-gold" />
                          <span>Secure encrypted payment</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Card Number</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-charcoal mb-2">Expiration Date</label>
                              <input type="text" placeholder="MM/YY" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-charcoal mb-2">CVC</label>
                              <input type="text" placeholder="123" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-charcoal mb-2">Name on Card</label>
                            <input type="text" placeholder="John Doe" className="w-full border border-rose-gold bg-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/50" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* COD details */}
                    {formData.paymentMethod === 'cod' && (
                      <div className="bg-cream/20 border border-cream rounded-xl p-6 mt-4 flex items-start space-x-4">
                        <div className="bg-white p-3 rounded-full shadow-sm text-rose-gold border border-cream flex-shrink-0">
                          <Banknote size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-dark-chocolate mb-1">Pay with cash upon delivery</h4>
                          <p className="text-sm text-charcoal/70 leading-relaxed">
                            Please prepare the exact amount of <span className="font-semibold">LKR {subtotal.toLocaleString()}</span>. Our delivery personnel may not carry sufficient change.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bank details */}
                    {formData.paymentMethod === 'bank' && (
                      <div className="bg-cream/20 border border-cream rounded-xl p-6 mt-4">
                        <p className="text-sm text-charcoal/80 leading-relaxed mb-6">
                          Make your payment directly into our bank account. Upload the Bank Payment Receipt and use your Order ID as the payment reference.
                        </p>
                        <h3 className="text-xl font-display font-bold text-dark-chocolate mb-4">Our bank details</h3>
                        <div className="mb-6 space-y-2 text-sm text-charcoal">
                          <p className="font-semibold underline underline-offset-2">Cake Paradise By Sayu.:</p>
                          <ul className="list-disc list-inside space-y-1 ml-1 text-charcoal/80">
                            <li><span className="font-medium">Bank:</span> Sampath Bank - Nattandiya</li>
                            <li><span className="font-medium">Account number:</span> 003510025929</li>
                          </ul>
                        </div>
                        <div className="border-t border-cream/50 pt-6">
                          <label className="block text-sm font-medium text-charcoal mb-2">Upload the bank payment receipt</label>
                          {!receiptFile ? (
                            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-charcoal/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-gold/10 file:text-rose-gold hover:file:bg-rose-gold/20 cursor-pointer" />
                          ) : (
                            <div className="flex items-center space-x-3">
                              <span className="py-2 px-4 rounded-full text-sm font-semibold bg-rose-gold/10 text-rose-gold opacity-80">Choose file</span>
                              <span className="text-sm text-charcoal/70 truncate max-w-xs">{receiptFile.name}</span>
                              <button type="button" onClick={() => setReceiptFile(null)} className="p-1 hover:bg-cream rounded-md transition-colors text-charcoal/60 hover:text-rose-gold">
                                <X size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Order Button */}
                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className={`w-full py-4 rounded-full font-bold text-lg text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                      isSendingOtp ? 'bg-rose-gold/70 cursor-not-allowed' : 'bg-rose-gold hover:bg-deep-burgundy hover:shadow-lg transform hover:-translate-y-1'
                    }`}
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Sending OTP…
                      </>
                    ) : (
                      <>
                        <Mail size={18} />
                        Confirm Order • LKR {subtotal.toLocaleString()}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-charcoal/40 mt-3">
                    A 6-digit verification code will be emailed to you before the order is placed.
                  </p>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-champagne-light rounded-3xl p-6 shadow-sm border border-champagne sticky top-24">
                <h3 className="font-display font-bold text-lg text-dark-chocolate mb-4">Order Summary</h3>
                <div className="max-h-[40vh] overflow-y-auto mb-4 space-y-4 pr-2">
                  {items.map(item => (
                    <div key={item.itemKey} className="flex space-x-3">
                      <div className="w-16 h-16 bg-champagne-light rounded-lg flex-shrink-0 flex items-center justify-center relative border border-champagne overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-charcoal/30">Img</span>
                        )}
                        <span className="absolute -top-2 -right-2 bg-charcoal text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-sm text-dark-chocolate leading-tight">{item.name}</p>
                        <p className="text-xs text-charcoal/60 mt-0.5">{item.weightLabel}</p>
                      </div>
                      <div className="font-semibold text-sm text-dark-chocolate">
                        LKR {item.lineTotal.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream/50 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-charcoal">
                    <span>Subtotal</span>
                    <span className="font-medium text-dark-chocolate">LKR {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-charcoal">
                    <span>Shipping</span>
                    <span className="text-charcoal/50 italic">Calculated at checkout</span>
                  </div>
                  <div className="border-t border-cream/50 pt-3 flex justify-between items-end">
                    <span className="font-bold text-dark-chocolate text-base">Total</span>
                    <span className="text-xl font-bold text-rose-gold">LKR {subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Checkout;
