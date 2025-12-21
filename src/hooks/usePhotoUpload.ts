import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { compressImage, compressBase64Image } from "@/lib/imageCompression";

const BUCKET_NAME = "merchant-photos";

export function usePhotoUpload() {
  const [isUploading, setIsUploading] = useState(false);

  // Convert base64 to Blob
  const base64ToBlob = (base64: string): Blob => {
    const parts = base64.split(",");
    const contentType = parts[0]?.match(/:(.*?);/)?.[1] || "image/jpeg";
    const byteCharacters = atob(parts[1] || parts[0]);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  };

  // Upload a photo (File or base64 string) to storage with compression
  const uploadPhoto = useCallback(async (
    fileOrBase64: File | string,
    merchantId: string,
    type: "cmu" | "location"
  ): Promise<string | null> => {
    try {
      setIsUploading(true);
      
      let fileToUpload: Blob;
      const fileName = `${merchantId}/${type}_${Date.now()}.jpg`;
      
      if (typeof fileOrBase64 === "string") {
        // It's a base64 string
        if (!fileOrBase64.startsWith("data:")) {
          // Already a URL, return as-is
          return fileOrBase64;
        }
        // Compress base64 image
        fileToUpload = await compressBase64Image(fileOrBase64);
      } else {
        // It's a File object - compress it
        fileToUpload = await compressImage(fileOrBase64);
      }

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileToUpload, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/jpeg",
        });

      if (error) {
        console.error("Upload error:", error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (err) {
      console.error("Photo upload failed:", err);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Upload multiple photos for a merchant
  const uploadMerchantPhotos = useCallback(async (
    merchantId: string,
    cmuPhoto: File | string | null,
    locationPhoto: File | string | null
  ): Promise<{ cmuPhotoUrl: string | null; locationPhotoUrl: string | null }> => {
    setIsUploading(true);
    
    try {
      const [cmuPhotoUrl, locationPhotoUrl] = await Promise.all([
        cmuPhoto ? uploadPhoto(cmuPhoto, merchantId, "cmu") : Promise.resolve(null),
        locationPhoto ? uploadPhoto(locationPhoto, merchantId, "location") : Promise.resolve(null),
      ]);

      return { cmuPhotoUrl, locationPhotoUrl };
    } finally {
      setIsUploading(false);
    }
  }, [uploadPhoto]);

  return {
    uploadPhoto,
    uploadMerchantPhotos,
    isUploading,
    base64ToBlob,
  };
}
