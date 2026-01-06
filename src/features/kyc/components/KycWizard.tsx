import { useState, useRef, useCallback } from 'react';
import { Camera, FileText, User, MapPin, Check, ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from '@/shared/ui';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { KycRequest } from '../types/kyc.types';

interface KycWizardProps {
  existingRequest?: KycRequest | null;
  merchantId?: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

type Step = 'document' | 'selfie' | 'address' | 'review';

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: 'document', label: 'Document', icon: <FileText className="w-5 h-5" /> },
  { id: 'selfie', label: 'Selfie', icon: <User className="w-5 h-5" /> },
  { id: 'address', label: 'Adresse', icon: <MapPin className="w-5 h-5" /> },
  { id: 'review', label: 'Validation', icon: <Check className="w-5 h-5" /> },
];

export function KycWizard({ existingRequest, merchantId, onComplete, onCancel }: KycWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('document');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [documentType, setDocumentType] = useState<string>(existingRequest?.id_document_type || '');
  const [documentNumber, setDocumentNumber] = useState(existingRequest?.id_document_number || '');
  const [documentImage, setDocumentImage] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(existingRequest?.id_document_url || null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(existingRequest?.selfie_url || null);
  const [address, setAddress] = useState(existingRequest?.address || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'document' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'document') {
        setDocumentImage(file);
        setDocumentPreview(reader.result as string);
      } else {
        setSelfieImage(file);
        setSelfiePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        setSelfieImage(file);
        setSelfiePreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from('merchant-photos')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('merchant-photos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!documentType || !documentNumber || !documentImage || !selfieImage || !address) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload des fichiers
      const timestamp = Date.now();
      const docUrl = await uploadFile(documentImage, `kyc/${user.id}/document_${timestamp}.jpg`);
      const selfieUrl = await uploadFile(selfieImage, `kyc/${user.id}/selfie_${timestamp}.jpg`);

      if (!docUrl || !selfieUrl) {
        throw new Error('Échec de l\'upload des fichiers');
      }

      // Créer ou mettre à jour la demande KYC
      const kycData = {
        user_id: user.id,
        merchant_id: merchantId || null,
        level: 'level_2' as const,
        status: 'submitted' as const,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
        id_document_type: documentType,
        id_document_url: docUrl,
        id_document_number: documentNumber,
        selfie_url: selfieUrl,
        address: address,
        submitted_at: new Date().toISOString(),
      };

      if (existingRequest?.id) {
        const { error } = await supabase
          .from('kyc_requests')
          .update(kycData)
          .eq('id', existingRequest.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('kyc_requests')
          .insert(kycData);

        if (error) throw error;
      }

      toast.success('Demande KYC soumise avec succès !');
      onComplete?.();
    } catch (err) {
      console.error('Erreur soumission KYC:', err);
      toast.error('Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goPrev = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'document':
        return documentType && documentNumber && documentPreview;
      case 'selfie':
        return selfiePreview;
      case 'address':
        return address.length >= 10;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full
              ${index <= stepIndex 
                ? 'bg-vert-manioc text-white' 
                : 'bg-gray-200 text-gray-500'}
              transition-colors
            `}>
              {step.icon}
            </div>
            <span className={`ml-2 text-sm font-medium hidden sm:block
              ${index <= stepIndex ? 'text-charbon' : 'text-gray-400'}`}>
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <ChevronRight className="w-5 h-5 mx-2 text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Contenu des étapes */}
      <GlassCard padding="lg">
        {currentStep === 'document' && (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-vert-manioc mb-3" />
              <h3 className="text-xl font-bold text-charbon">Pièce d'identité</h3>
              <p className="text-charbon/60 mt-1">
                Prenez en photo votre CNI, passeport ou carte CMU
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Type de document</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cni">Carte Nationale d'Identité (CNI)</SelectItem>
                    <SelectItem value="passport">Passeport</SelectItem>
                    <SelectItem value="cmu">Carte CMU</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Numéro du document</Label>
                <Input
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ex: CI-0123456789"
                />
              </div>

              <div>
                <Label>Photo du document</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFileChange(e, 'document')}
                  className="hidden"
                />
                
                {documentPreview ? (
                  <div className="relative mt-2">
                    <img 
                      src={documentPreview} 
                      alt="Document" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setDocumentImage(null);
                        setDocumentPreview(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-32 mt-2 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Cliquez pour prendre une photo
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 'selfie' && (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-12 h-12 mx-auto text-vert-manioc mb-3" />
              <h3 className="text-xl font-bold text-charbon">Photo selfie</h3>
              <p className="text-charbon/60 mt-1">
                Prenez une photo de votre visage bien éclairé
              </p>
            </div>

            <div className="space-y-4">
              <input
                ref={selfieInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={(e) => handleFileChange(e, 'selfie')}
                className="hidden"
              />

              {isCameraActive ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg bg-black"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 border-4 border-white/50 rounded-full" />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" onClick={stopCamera}>
                      Annuler
                    </Button>
                    <Button className="flex-1 bg-vert-manioc" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-2" />
                      Capturer
                    </Button>
                  </div>
                </div>
              ) : selfiePreview ? (
                <div className="relative">
                  <img 
                    src={selfiePreview} 
                    alt="Selfie" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelfieImage(null);
                      setSelfiePreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-32"
                    onClick={() => selfieInputRef.current?.click()}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm">Depuis la galerie</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-32"
                    onClick={startCamera}
                  >
                    <div className="text-center">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm">Prendre un selfie</span>
                    </div>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'address' && (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto text-vert-manioc mb-3" />
              <h3 className="text-xl font-bold text-charbon">Adresse de résidence</h3>
              <p className="text-charbon/60 mt-1">
                Indiquez votre adresse complète
              </p>
            </div>

            <div>
              <Label>Adresse</Label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Cocody Angré 8ème Tranche, près de la pharmacie du bonheur, Abidjan"
                className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-vert-manioc focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 caractères. Soyez le plus précis possible.
              </p>
            </div>
          </div>
        )}

        {currentStep === 'review' && (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-12 h-12 mx-auto text-vert-manioc mb-3" />
              <h3 className="text-xl font-bold text-charbon">Vérification</h3>
              <p className="text-charbon/60 mt-1">
                Vérifiez vos informations avant de soumettre
              </p>
            </div>

            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Type de document</span>
                <span className="font-medium">
                  {documentType === 'cni' ? 'CNI' : documentType === 'passport' ? 'Passeport' : 'CMU'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Numéro</span>
                <span className="font-medium">{documentNumber}</span>
              </div>
              <div className="flex gap-2">
                {documentPreview && (
                  <img src={documentPreview} alt="Document" className="w-20 h-20 object-cover rounded" />
                )}
                {selfiePreview && (
                  <img src={selfiePreview} alt="Selfie" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
              <div>
                <span className="text-gray-600">Adresse</span>
                <p className="font-medium text-sm mt-1">{address}</p>
              </div>
            </div>

            <p className="text-xs text-center text-gray-500">
              En soumettant, vous certifiez que les informations fournies sont exactes.
            </p>
          </div>
        )}
      </GlassCard>

      {/* Navigation */}
      <div className="flex gap-3">
        {stepIndex > 0 ? (
          <Button variant="outline" className="flex-1" onClick={goPrev}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        ) : (
          <Button variant="ghost" className="flex-1" onClick={onCancel}>
            Annuler
          </Button>
        )}
        
        {currentStep === 'review' ? (
          <Button 
            className="flex-1 bg-vert-manioc hover:bg-vert-manioc/90"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Envoi...' : 'Soumettre ma demande'}
          </Button>
        ) : (
          <Button 
            className="flex-1 bg-vert-manioc hover:bg-vert-manioc/90"
            onClick={goNext}
            disabled={!canProceed()}
          >
            Continuer
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
