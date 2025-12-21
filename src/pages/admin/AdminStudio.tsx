import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudioProgressBar } from '@/components/studio/StudioProgressBar';
import { StudioRecorder } from '@/components/studio/StudioRecorder';
import { StudioTextList } from '@/components/studio/StudioTextList';
import { translations, LANGUAGES, LanguageCode } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mic, Download, RefreshCw } from 'lucide-react';

interface RecordingStatus {
  [key: string]: boolean;
}

export default function AdminStudio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('dioula');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>({});
  const [isLoading, setIsLoading] = useState(true);

  // Get all translation keys for selected language
  const translationItems = useMemo(() => {
    const langTranslations = translations[selectedLanguage] || {};
    return Object.entries(langTranslations).map(([key, value]) => ({
      key,
      value,
      category: 'general',
      isRecorded: recordingStatus[`${selectedLanguage}:${key}`] || false
    }));
  }, [selectedLanguage, recordingStatus]);

  const selectedItem = translationItems.find(item => item.key === selectedKey);
  const recordedCount = translationItems.filter(item => item.isRecorded).length;

  // Load recording status from database
  useEffect(() => {
    loadRecordingStatus();
  }, []);

  const loadRecordingStatus = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('audio_recordings')
        .select('audio_key, language_code');

      if (error) throw error;

      const status: RecordingStatus = {};
      data?.forEach(recording => {
        status[`${recording.language_code}:${recording.audio_key}`] = true;
      });
      setRecordingStatus(status);
    } catch (err) {
      console.error('Error loading recordings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecording = async (audioBlob: Blob, duration: number) => {
    if (!selectedKey) return;

    try {
      const fileName = `${selectedLanguage}/${selectedKey}.webm`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('audio_recordings')
        .upsert({
          audio_key: selectedKey,
          language_code: selectedLanguage,
          file_path: urlData.publicUrl,
          duration_seconds: duration
        }, {
          onConflict: 'audio_key,language_code'
        });

      if (dbError) throw dbError;

      // Update local state
      setRecordingStatus(prev => ({
        ...prev,
        [`${selectedLanguage}:${selectedKey}`]: true
      }));

      toast({
        title: "Enregistrement sauvegardé",
        description: `"${selectedKey}" a été enregistré avec succès.`
      });

      // Auto-select next unrecorded item
      const nextUnrecorded = translationItems.find(
        item => !item.isRecorded && item.key !== selectedKey
      );
      if (nextUnrecorded) {
        setSelectedKey(nextUnrecorded.key);
      }

    } catch (err) {
      console.error('Error saving recording:', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'enregistrement.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const handleSkip = () => {
    const currentIndex = translationItems.findIndex(item => item.key === selectedKey);
    const nextItem = translationItems[currentIndex + 1];
    if (nextItem) {
      setSelectedKey(nextItem.key);
    }
  };

  const handlePlayRecording = async (key: string) => {
    try {
      const { data } = await supabase
        .from('audio_recordings')
        .select('file_path')
        .eq('audio_key', key)
        .eq('language_code', selectedLanguage)
        .single();

      if (data?.file_path) {
        const audio = new Audio(data.file_path);
        audio.play();
      }
    } catch (err) {
      console.error('Error playing recording:', err);
    }
  };

  const handleExportAll = async () => {
    toast({
      title: "Export en cours...",
      description: "Cette fonctionnalité sera disponible prochainement."
    });
  };

  // Auto-select first unrecorded item on language change
  useEffect(() => {
    if (!isLoading) {
      const firstUnrecorded = translationItems.find(item => !item.isRecorded);
      setSelectedKey(firstUnrecorded?.key || translationItems[0]?.key || null);
    }
  }, [selectedLanguage, isLoading]);

  const currentLanguageInfo = LANGUAGES.find(l => l.code === selectedLanguage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  Studio Audio IFN
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enregistrez les voix pour l'accessibilité
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select 
                value={selectedLanguage} 
                onValueChange={(v) => setSelectedLanguage(v as LanguageCode)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.symbol} {lang.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={loadRecordingStatus}>
                <RefreshCw className="h-4 w-4" />
              </Button>

              <Button variant="outline" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <StudioProgressBar
          recorded={recordedCount}
          total={translationItems.length}
          language={currentLanguageInfo?.nativeName || selectedLanguage}
        />
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text list */}
          <div>
            <StudioTextList
              items={translationItems}
              selectedKey={selectedKey}
              onSelect={setSelectedKey}
              onPlay={handlePlayRecording}
            />
          </div>

          {/* Recorder */}
          <div>
            {selectedItem ? (
              <StudioRecorder
                textKey={selectedItem.key}
                textValue={selectedItem.value}
                language={selectedLanguage}
                isRecorded={selectedItem.isRecorded}
                onSave={handleSaveRecording}
                onSkip={handleSkip}
              />
            ) : (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez un texte à gauche pour commencer l'enregistrement
                </p>
              </div>
            )}

            {/* Quick guide */}
            <div className="mt-4 p-4 bg-muted/50 rounded-xl">
              <h3 className="font-medium text-foreground mb-2">
                🎙️ Guide d'enregistrement
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>1. Sélectionnez un texte dans la liste</li>
                <li>2. Cliquez sur "Enregistrer" et lisez le texte</li>
                <li>3. Écoutez et validez ou recommencez</li>
                <li>4. L'audio est automatiquement sauvegardé</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
