// Sri Lankan phone number validation
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  // Sri Lankan numbers: +94XXXXXXXXX (11 digits) or 0XXXXXXXXX (10 digits)
  if (cleaned.startsWith('94') && cleaned.length === 11) return true;
  if (cleaned.startsWith('0') && cleaned.length === 10) return true;
  return false;
};

// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Required field validation
export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

// Delivery date validation
export const validateDeliveryDate = (date, minLeadDays = 1) => {
  if (!date) return { valid: false, message: 'Delivery date is required' };
  
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minLeadDays);
  
  if (selected < today) {
    return { valid: false, message: 'Delivery date cannot be in the past' };
  }
  
  if (selected < minDate) {
    return { valid: false, message: `Please allow at least ${minLeadDays} day(s) for preparation` };
  }
  
  return { valid: true, message: '' };
};

// Validate checkout form
export const validateCheckoutForm = (formData, maxLeadDays = 1) => {
  const errors = {};

  if (!validateRequired(formData.name)) {
    errors.name = 'Full name is required';
  }

  if (!validateRequired(formData.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid Sri Lankan phone number';
  }

  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (formData.deliveryMethod === 'delivery') {
    if (!validateRequired(formData.deliveryAddress)) {
      errors.deliveryAddress = 'Delivery address is required';
    }
    if (!validateRequired(formData.district)) {
      errors.district = 'Please select a delivery district';
    }
  }

  if (!validateRequired(formData.deliveryDate)) {
    errors.deliveryDate = 'Delivery date is required';
  } else {
    const dateValidation = validateDeliveryDate(formData.deliveryDate, maxLeadDays);
    if (!dateValidation.valid) {
      errors.deliveryDate = dateValidation.message;
    }
  }

  if (!validateRequired(formData.timeSlot)) {
    errors.timeSlot = 'Please select a time slot';
  }

  if (!validateRequired(formData.paymentMethod)) {
    errors.paymentMethod = 'Please select a payment method';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate custom inquiry form
export const validateInquiryForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.name)) errors.name = 'Name is required';
  if (!validateRequired(formData.phone)) {
    errors.phone = 'Phone number is required';
  } else if (!validatePhone(formData.phone)) {
    errors.phone = 'Please enter a valid Sri Lankan phone number';
  }
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = 'Invalid email address';
  }
  if (!validateRequired(formData.eventDate)) errors.eventDate = 'Event date is required';
  if (!validateRequired(formData.description)) errors.description = 'Please describe your cake requirements';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Validate product form (admin)
export const validateProductForm = (formData) => {
  const errors = {};

  if (!validateRequired(formData.name)) errors.name = 'Product name is required';
  if (!validateRequired(formData.categoryId)) errors.categoryId = 'Category is required';
  if (!formData.basePrice || formData.basePrice <= 0) errors.basePrice = 'Valid base price is required';
  if (!formData.weights || formData.weights.length === 0) errors.weights = 'At least one weight option is required';
  if (!formData.flavors || formData.flavors.length === 0) errors.flavors = 'At least one flavor is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
