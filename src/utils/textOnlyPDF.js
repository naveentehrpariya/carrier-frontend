/**
 * Text-only PDF generation for minimal file sizes
 * This creates PDFs using only text content, no HTML rendering
 */

import { jsPDF } from 'jspdf';

export const generateTextOnlyPDF = (order, company, filename, options = {}) => {
  const {
    onProgress = null
  } = options;

  try {
    if (onProgress) onProgress('Creating text-only PDF...');
    
    // Create PDF with minimal settings
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    });

    // Set minimal font size
    doc.setFontSize(8);
    let yPosition = 20;

    // Add basic header
    doc.setFontSize(16);
    doc.text('INVOICE', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.text(`Company: ${company?.name || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Email: ${company?.email || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${company?.phone || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Order details
    doc.text(`Order #: CMC${order?.serial_no || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Customer: ${order?.customer?.name || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Amount: ${order?.total_amount || 0} ${order?.revenue_currency || 'CAD'}`, 20, yPosition);
    yPosition += 10;

    // Revenue items (simplified)
    if (order?.revenue_items && order.revenue_items.length > 0) {
      doc.text('CHARGES:', 20, yPosition);
      yPosition += 5;
      
      order.revenue_items.forEach(item => {
        if (yPosition > 270) { // Near bottom, add new page
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${item.revenue_item}: ${item.rate} x ${item.quantity} = ${item.rate * item.quantity}`, 20, yPosition);
        yPosition += 4;
      });
    }

    // Add date
    yPosition += 10;
    const today = new Date();
    doc.text(`Date: ${today.toLocaleDateString()}`, 20, yPosition);

    if (onProgress) onProgress('Saving text-only PDF...');
    
    // Save the PDF
    doc.save(filename);
    
    return {
      success: true,
      method: 'text-only'
    };
    
  } catch (error) {
    console.error('Text-only PDF generation failed:', error);
    throw error;
  }
};

export const generateTextOnlyOrderPDF = (order, company, filename, options = {}) => {
  const {
    onProgress = null
  } = options;

  try {
    if (onProgress) onProgress('Creating text-only rate confirmation...');
    
    // Create PDF with minimal settings
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    });

    // Set minimal font size
    doc.setFontSize(8);
    let yPosition = 20;

    // Add basic header
    doc.setFontSize(16);
    doc.text('RATE CONFIRMATION', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(8);
    doc.text(`Cross Miles Carrier`, 20, yPosition);
    yPosition += 5;
    doc.text(`${company?.address || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Order details
    doc.text(`PRO #: CMC${order?.serial_no || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Carrier: ${order?.carrier?.name || 'N/A'}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Phone: ${order?.carrier?.phone || 'N/A'}`, 20, yPosition);
    yPosition += 10;

    // Shipping details (simplified)
    if (order?.shipping_details && order.shipping_details.length > 0) {
      order.shipping_details.forEach(ship => {
        doc.text(`Commodity: ${ship?.commodity?.value || ship?.commodity || 'N/A'}`, 20, yPosition);
        yPosition += 4;
        doc.text(`Equipment: ${ship?.equipment?.value || 'N/A'}`, 20, yPosition);
        yPosition += 4;
        doc.text(`Weight: ${ship?.weight || 'N/A'}${ship?.weight_unit || ''}`, 20, yPosition);
        yPosition += 6;
      });
    }

    // Carrier revenue items (simplified)
    if (order?.carrier_revenue_items && order.carrier_revenue_items.length > 0) {
      doc.text('CHARGES:', 20, yPosition);
      yPosition += 5;
      
      order.carrier_revenue_items.forEach(item => {
        if (yPosition > 270) { // Near bottom, add new page
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`${item.revenue_item}: ${item.rate} x ${item.quantity} = ${item.rate * item.quantity}`, 20, yPosition);
        yPosition += 4;
      });
    }

    // Add date
    yPosition += 10;
    const today = new Date();
    doc.text(`Date: ${today.toLocaleDateString()}`, 20, yPosition);

    if (onProgress) onProgress('Saving text-only rate confirmation...');
    
    // Save the PDF
    doc.save(filename);
    
    return {
      success: true,
      method: 'text-only'
    };
    
  } catch (error) {
    console.error('Text-only order PDF generation failed:', error);
    throw error;
  }
};
