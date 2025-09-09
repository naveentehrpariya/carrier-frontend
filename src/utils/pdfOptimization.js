/**
 * PDF Optimization Utilities
 * This utility provides functions to optimize images and PDFs for smaller file sizes
 */

/**
 * Compress image data URL to reduce file size
 * @param {string} dataURL - The data URL of the image
 * @param {number} quality - Quality level (0.1 to 1.0)
 * @param {number} maxWidth - Maximum width to resize to
 * @returns {Promise<string>} Compressed data URL
 */
export const compressImageDataURL = (dataURL, quality = 0.7, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataURL);
    };
    
    img.src = dataURL;
  });
};

/**
 * Optimized jsPDF configuration for smaller file sizes
 */
export const getOptimizedPDFConfig = () => ({
  unit: 'mm',
  format: 'a4',
  orientation: 'portrait',
  compress: true,
  precision: 1,
  userUnit: 1.0,
  floatPrecision: 2,
});

/**
 * Optimized html2canvas configuration for smaller file sizes
 */
export const getOptimizedCanvasConfig = () => ({
  scale: 0.2,
  useCORS: true,
  allowTaint: true,
  backgroundColor: null,
  logging: false,
  imageTimeout: 10000,
  removeContainer: true,
  pixelRatio: 1,
  foreignObjectRendering: false,
  quality: 0.7,
  onclone: function(clonedDoc) {
    // Optimize fonts and elements for smaller size
    clonedDoc.querySelectorAll('*').forEach(el => {
      const style = el.style;
      if (style.fontWeight === 'bold' || style.fontWeight === '700' || style.fontWeight === '900') {
        style.fontWeight = '500'; // Lighter bold for smaller file
      }
      // Remove unnecessary styles that increase file size
      if (style.textShadow) style.textShadow = 'none';
      if (style.boxShadow) style.boxShadow = 'none';
      if (style.filter) style.filter = 'none';
    });
  }
});

/**
 * Optimized header canvas configuration
 */
export const getOptimizedHeaderCanvasConfig = () => ({
  scale: 1.5,
  useCORS: true,
  allowTaint: true,
  backgroundColor: null,
  logging: false,
  pixelRatio: 1,
  dpi: 150,
  letterRendering: false,
});

/**
 * Get optimized image compression quality based on image type
 * @param {string} imageType - Type of image ('header', 'watermark', 'content')
 * @returns {number} Quality value between 0 and 1
 */
export const getImageQuality = (imageType) => {
  const qualityMap = {
    header: 0.6,
    watermark: 0.8, // Higher quality for watermark to maintain clarity
    content: 0.6
  };
  return qualityMap[imageType] || 0.6;
};

/**
 * Aggressively compress canvas content for PDFs
 * @param {HTMLCanvasElement} canvas - The canvas to compress
 * @param {number} quality - JPEG quality (0.1 to 1.0)
 * @returns {string} Compressed data URL
 */
export const aggressiveCanvasCompression = (canvas, quality = 0.5) => {
  // Create a temporary canvas for compression
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  // Reduce canvas size by 20% for compression
  const scale = 0.8;
  tempCanvas.width = canvas.width * scale;
  tempCanvas.height = canvas.height * scale;
  
  // Draw scaled down version
  tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // Return compressed JPEG
  return tempCanvas.toDataURL('image/jpeg', quality);
};

/**
 * Ultra-optimized jsPDF configuration for minimum file sizes
 */
export const getUltraOptimizedPDFConfig = () => ({
  unit: 'mm',
  format: 'a4',
  orientation: 'portrait',
  compress: true,
  precision: 0.5, // Ultra low precision
  userUnit: 1.0,
  floatPrecision: 1, // Minimum float precision
});

/**
 * Ultra-optimized html2canvas configuration for minimum file sizes
 */
export const getUltraOptimizedCanvasConfig = () => ({
  scale: 0.12, // Very aggressive scale reduction
  useCORS: true,
  allowTaint: true,
  backgroundColor: 'white',
  logging: false,
  imageTimeout: 6000,
  removeContainer: true,
  pixelRatio: 1,
  foreignObjectRendering: false,
  quality: 0.5, // Very low quality for minimum size
  onclone: function(clonedDoc) {
    // Ultra aggressive optimization
    clonedDoc.querySelectorAll('*').forEach(el => {
      const style = el.style;
      // Remove all font weights
      style.fontWeight = '400';
      // Remove all visual effects
      if (style.textShadow) style.textShadow = 'none';
      if (style.boxShadow) style.boxShadow = 'none';
      if (style.borderRadius) style.borderRadius = '0';
      if (style.border && style.border !== '1px solid #000') style.border = 'none';
      if (style.background && style.background !== 'white') style.background = 'white';
      if (style.backgroundColor && style.backgroundColor !== 'white') {
        style.backgroundColor = 'white';
      }
      if (style.gradient) style.background = 'white';
      // Simplify colors to basic ones
      if (style.color && style.color !== '#000' && style.color !== 'black') {
        const colorValue = style.color;
        if (colorValue.includes('blue') || colorValue.includes('#2563eb') || colorValue.includes('#4b57ff')) {
          style.color = '#000080'; // Simple blue
        } else if (colorValue.includes('red') || colorValue.includes('#b91c1c')) {
          style.color = '#800000'; // Simple red
        } else {
          style.color = '#000'; // Default to black
        }
      }
    });
  }
});
