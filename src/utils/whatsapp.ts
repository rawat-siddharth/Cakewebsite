export const BAKERY_WHATSAPP_NUMBER = '917976541365';
export const BAKERY_NAME = 'Cake N Crave';
export const BAKERY_LOCATION = 'Jaipur, Rajasthan, India';
export const BAKERY_INSTAGRAM = 'https://instagram.com';

export interface SingleProductOrderParams {
  productName: string;
  selectedSize?: string;
  selectedFlavour?: string;
  selectedFlavours?: string[];
  flavourDistribution?: string;
  selectedAddOns?: Array<{ id: string; name: string; price: number }>;
  customMessage?: string;
  quantity: number;
  price: number;
  unitPrice?: number;
  deliveryDate?: string;
  deliveryArea?: string;
  specialInstructions?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface CartItemOrder {
  id: string;
  productName: string;
  selectedSize?: string;
  selectedFlavour?: string;
  selectedFlavours?: string[];
  flavourDistribution?: string;
  selectedAddOns?: Array<{ id: string; name: string; price: number }>;
  customMessage?: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string;
}

export interface CustomerOrderDetails {
  name: string;
  phone: string;
  deliveryDate: string;
  deliveryArea: string;
  specialInstructions?: string;
}

/**
 * Builds the readable message string for a single product order directly from product page.
 */
export function generateSingleProductOrderMessage(params: SingleProductOrderParams): string {
  const lines: string[] = [];

  lines.push(`Hello Cake N Crave! I would like to place an order.`);
  lines.push('');
  lines.push(`Product: ${params.productName}`);
  
  if (params.selectedSize) {
    lines.push(`Weight: ${params.selectedSize}`);
  }

  // Format flavours
  const flavoursText = (params.selectedFlavours && params.selectedFlavours.length > 0)
    ? params.selectedFlavours.join(' + ')
    : params.selectedFlavour;
  if (flavoursText) {
    const isMultiple = (params.selectedFlavours && params.selectedFlavours.length > 1) || flavoursText.includes(' + ');
    lines.push(`${isMultiple ? 'Flavours' : 'Flavour'}: ${flavoursText}`);
  }

  if (params.flavourDistribution && params.flavourDistribution.trim()) {
    lines.push(`Flavour Distribution: ${params.flavourDistribution.trim()}`);
  }

  if (params.selectedAddOns && params.selectedAddOns.length > 0) {
    const addonsStr = params.selectedAddOns.map((a) => `${a.name} (+₹${a.price})`).join(', ');
    lines.push(`Add-ons: ${addonsStr}`);
  }

  lines.push(`Quantity: ${params.quantity}`);
  lines.push('');

  const unitPrice = params.unitPrice || params.price;
  const totalPrice = unitPrice * params.quantity;
  lines.push(`Unit Price: ₹${unitPrice}`);
  lines.push(`Total: ₹${totalPrice}`);
  lines.push('');

  if (params.customMessage && params.customMessage.trim()) {
    lines.push(`Custom Message: ${params.customMessage.trim()}`);
  }
  if (params.deliveryDate && params.deliveryDate.trim()) {
    lines.push(`Preferred Delivery Date: ${params.deliveryDate.trim()}`);
  }
  if (params.deliveryArea && params.deliveryArea.trim()) {
    lines.push(`Delivery Area: ${params.deliveryArea.trim()}, Jaipur`);
  }
  if (params.customerName && params.customerName.trim()) {
    lines.push(`Customer Name: ${params.customerName.trim()}`);
  }
  if (params.customerPhone && params.customerPhone.trim()) {
    lines.push(`Contact Phone: ${params.customerPhone.trim()}`);
  }
  if (params.specialInstructions && params.specialInstructions.trim()) {
    lines.push(`Special Instructions: ${params.specialInstructions.trim()}`);
  }

  lines.push('');
  lines.push('Please confirm availability and order details.');
  lines.push('Thank you!');

  return lines.join('\n');
}

/**
 * Builds the formatted readable message string for a full cart order.
 */
export function generateWhatsAppOrderMessage(
  items: CartItemOrder[],
  customer: Partial<CustomerOrderDetails>,
  subtotal: number
): string {
  const lines: string[] = [];

  lines.push(`Hello Cake N Crave! I would like to place an order.`);
  lines.push('');
  lines.push('Order Details:');
  lines.push('----------------------------------------');

  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.productName}`);
    if (item.selectedSize) {
      lines.push(`   Weight: ${item.selectedSize}`);
    }

    const flavoursText = (item.selectedFlavours && item.selectedFlavours.length > 0)
      ? item.selectedFlavours.join(' + ')
      : item.selectedFlavour;
    if (flavoursText) {
      const isMultiple = (item.selectedFlavours && item.selectedFlavours.length > 1) || flavoursText.includes(' + ');
      lines.push(`   ${isMultiple ? 'Flavours' : 'Flavour'}: ${flavoursText}`);
    }

    if (item.flavourDistribution && item.flavourDistribution.trim()) {
      lines.push(`   Flavour Distribution: ${item.flavourDistribution.trim()}`);
    }

    if (item.selectedAddOns && item.selectedAddOns.length > 0) {
      const addonsStr = item.selectedAddOns.map((a) => `${a.name} (+₹${a.price})`).join(', ');
      lines.push(`   Add-ons: ${addonsStr}`);
    }

    if (item.customMessage && item.customMessage.trim()) {
      lines.push(`   Custom Message: "${item.customMessage.trim()}"`);
    }

    lines.push(`   Quantity: ${item.quantity}`);
    lines.push(`   Unit Price: ₹${item.unitPrice}`);
    lines.push(`   Item Total: ₹${item.unitPrice * item.quantity}`);
    
    if (item.specialInstructions && item.specialInstructions.trim()) {
      lines.push(`   Notes: ${item.specialInstructions.trim()}`);
    }
    lines.push('');
  });

  lines.push('----------------------------------------');
  lines.push(`Total Amount: ₹${subtotal}`);
  lines.push('');

  if (customer.name && customer.name.trim()) {
    lines.push(`Customer Name: ${customer.name.trim()}`);
  }
  if (customer.phone && customer.phone.trim()) {
    lines.push(`Mobile Number: ${customer.phone.trim()}`);
  }
  if (customer.deliveryDate && customer.deliveryDate.trim()) {
    lines.push(`Preferred Delivery Date: ${customer.deliveryDate.trim()}`);
  }
  if (customer.deliveryArea && customer.deliveryArea.trim()) {
    lines.push(`Delivery Area: ${customer.deliveryArea.trim()}, Jaipur`);
  } else {
    lines.push(`Delivery Area: Jaipur, Rajasthan`);
  }
  if (customer.specialInstructions && customer.specialInstructions.trim()) {
    lines.push(`Special Instructions: ${customer.specialInstructions.trim()}`);
  }

  lines.push('');
  lines.push('Please confirm availability and order details.');
  lines.push('Thank you!');

  return lines.join('\n');
}

/**
 * Converts a text message into the official WhatsApp direct chat link.
 */
export function buildWhatsAppLink(message: string): string {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${BAKERY_WHATSAPP_NUMBER}?text=${encoded}`;
}

/**
 * Direct general enquiry WhatsApp link
 */
export function getGeneralWhatsAppLink(topic?: string): string {
  const message = topic
    ? `Hello Cake N Crave! I would like to inquire about ${topic}.`
    : `Hello Cake N Crave! I would like to inquire about your handcrafted cakes and gift options in Jaipur.`;
  return buildWhatsAppLink(message);
}
