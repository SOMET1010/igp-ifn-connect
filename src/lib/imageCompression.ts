const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_DIMENSION = 1920;
const INITIAL_QUALITY = 0.8;
const MIN_QUALITY = 0.5;

/**
 * Compress an image file to max 1MB with 80% quality
 */
export async function compressImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Compress with decreasing quality until under max size
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // If under max size or quality is at minimum, return the blob
            if (blob.size <= MAX_FILE_SIZE || quality <= MIN_QUALITY) {
              console.log(`Image compressed: ${(blob.size / 1024).toFixed(1)}KB at ${(quality * 100).toFixed(0)}% quality`);
              resolve(blob);
            } else {
              // Try again with lower quality
              tryCompress(quality - 0.1);
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryCompress(INITIAL_QUALITY);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Compress a base64 image string
 */
export async function compressBase64Image(base64: string): Promise<Blob> {
  // Convert base64 to blob first
  const parts = base64.split(",");
  const contentType = parts[0]?.match(/:(.*?);/)?.[1] || "image/jpeg";
  const byteCharacters = atob(parts[1] || parts[0]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: contentType });

  return compressImage(blob);
}
