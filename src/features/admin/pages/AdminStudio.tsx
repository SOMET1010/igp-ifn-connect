import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudioProgressBar } from '@/features/voice-assistant/components/studio/StudioProgressBar';
import { StudioRecorder } from '@/features/voice-assistant/components/studio/StudioRecorder';
import { StudioTextList } from '@/features/voice-assistant/components/studio/StudioTextList';
import { StudioSessionProgress } from '@/features/voice-assistant/components/studio/StudioSessionProgress';
import { StudioSessionComplete } from '@/features/voice-assistant/components/studio/StudioSessionComplete';
import { translations, LANGUAGES, LanguageCode } from '@/lib/translations';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/shared/hooks';
import { ArrowLeft, Mic, Download, RefreshCw, PlayCircle } from 'lucide-react';
import { adminLogger } from '@/infra/logger';
import { UnifiedBottomNav } from '@/shared/ui';
import { adminSecondaryNavItems } from '@/config/navigation';

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
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);
  
  // Session mode state
  const [sessionMode, setSessionMode] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionRecordedCount, setSessionRecordedCount] = useState(0);

  // Get all translation keys for selected language
  // Always show French text as reference, recording will be in the selected language
  const translationItems = useMemo(() => {
    const frenchTranslations = translations['fr'] || {};
    return Object.entries(frenchTranslations).map(([key, value]) => ({
      key,
      value, // Always show French text as reference
      category: 'general',
      isRecorded: recordingStatus[`${selectedLanguage}:${key}`] || false
    }));
  }, [selectedLanguage, recordingStatus]);

  // Unrecorded items for session mode
  const unrecordedItems = useMemo(() => 
    translationItems.filter(item => !item.isRecorded), 
    [translationItems]
  );

  const selectedItem = translationItems.find(item => item.key === selectedKey);
  const recordedCount = translationItems.filter(item => item.isRecorded).length;

  // Session mode current item
  const sessionItem = sessionMode ? unrecordedItems[sessionIndex] : null;
  const isSessionComplete = sessionMode && sessionIndex >= unrecordedItems.length;

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
      adminLogger.error('Error loading recordings', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing audio URL when selected key changes
  const loadExistingAudioUrl = useCallback(async () => {
    if (!selectedKey || !recordingStatus[`${selectedLanguage}:${selectedKey}`]) {
      setExistingAudioUrl(null);
      return;
    }

    try {
      const { data } = await supabase
        .from('audio_recordings')
        .select('file_path')
        .eq('audio_key', selectedKey)
        .eq('language_code', selectedLanguage)
        .single();

      setExistingAudioUrl(data?.file_path || null);
    } catch (err) {
      adminLogger.error('Error loading existing audio', err);
      setExistingAudioUrl(null);
    }
  }, [selectedKey, selectedLanguage, recordingStatus]);

  useEffect(() => {
    loadExistingAudioUrl();
  }, [loadExistingAudioUrl]);

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

      // Update existing audio URL
      setExistingAudioUrl(urlData.publicUrl);

      toast({
        title: "Enregistrement sauvegardé",
        description: `"${selectedKey}" a été enregistré avec succès.`
      });

      // Handle session mode progression
      if (sessionMode) {
        setSessionRecordedCount(prev => prev + 1);
        // Move to next item in session
        setSessionIndex(prev => prev + 1);
      } else {
        // Auto-select next unrecorded item in normal mode
        const nextUnrecorded = translationItems.find(
          item => !item.isRecorded && item.key !== selectedKey
        );
        if (nextUnrecorded) {
          setSelectedKey(nextUnrecorded.key);
        }
      }

    } catch (err) {
      adminLogger.error('Error saving recording', err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'enregistrement.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const handleDeleteRecording = async () => {
    if (!selectedKey) return;

    try {
      const fileName = `${selectedLanguage}/${selectedKey}.webm`;

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('audio-recordings')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('audio_recordings')
        .delete()
        .eq('audio_key', selectedKey)
        .eq('language_code', selectedLanguage);

      if (dbError) throw dbError;

      // Update local state
      setRecordingStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[`${selectedLanguage}:${selectedKey}`];
        return newStatus;
      });

      setExistingAudioUrl(null);

      toast({
        title: "Enregistrement supprimé",
        description: `"${selectedKey}" a été supprimé.`
      });

    } catch (err) {
      adminLogger.error('Error deleting recording', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'enregistrement.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const handleSkip = () => {
    if (sessionMode) {
      // In session mode, move to next in queue
      setSessionIndex(prev => Math.min(prev + 1, unrecordedItems.length));
    } else {
      const currentIndex = translationItems.findIndex(item => item.key === selectedKey);
      const nextItem = translationItems[currentIndex + 1];
      if (nextItem) {
        setSelectedKey(nextItem.key);
      }
    }
  };

  // Session mode controls
  const startSession = () => {
    if (unrecordedItems.length === 0) {
      toast({
        title: "Aucun texte à enregistrer",
        description: "Tous les textes ont déjà été enregistrés.",
      });
      return;
    }
    setSessionMode(true);
    setSessionIndex(0);
    setSessionRecordedCount(0);
    setSelectedKey(unrecordedItems[0]?.key);
  };

  const exitSession = () => {
    setSessionMode(false);
    setSessionIndex(0);
    // Keep current selected key or select first unrecorded
    const firstUnrecorded = translationItems.find(item => !item.isRecorded);
    setSelectedKey(firstUnrecorded?.key || translationItems[0]?.key || null);
  };

  const goToPreviousInSession = () => {
    if (sessionIndex > 0) {
      setSessionIndex(prev => prev - 1);
    }
  };

  const goToNextInSession = () => {
    if (sessionIndex < unrecordedItems.length - 1) {
      setSessionIndex(prev => prev + 1);
    }
  };

  // Update selected key when session index changes
  useEffect(() => {
    if (sessionMode && unrecordedItems[sessionIndex]) {
      setSelectedKey(unrecordedItems[sessionIndex].key);
    }
  }, [sessionIndex, sessionMode, unrecordedItems]);

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
      adminLogger.error('Error playing recording', err);
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
    <div className="min-h-screen bg-background pb-20">
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

              {!sessionMode && unrecordedItems.length > 0 && (
                <Button onClick={startSession} className="gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Session ({unrecordedItems.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar - hide in session mode */}
      {!sessionMode && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <StudioProgressBar
            recorded={recordedCount}
            total={translationItems.length}
            language={currentLanguageInfo?.nativeName || selectedLanguage}
          />
        </div>
      )}

      {/* Session mode progress */}
      {sessionMode && !isSessionComplete && (
        <div className="max-w-7xl mx-auto px-4 py-4">
          <StudioSessionProgress
            current={sessionIndex}
            total={unrecordedItems.length}
            onExit={exitSession}
            onPrevious={goToPreviousInSession}
            onNext={goToNextInSession}
            canGoPrevious={sessionIndex > 0}
            canGoNext={sessionIndex < unrecordedItems.length - 1}
          />
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {/* Session complete screen */}
        {isSessionComplete ? (
          <div className="max-w-xl mx-auto">
            <StudioSessionComplete
              recordedCount={sessionRecordedCount}
              language={currentLanguageInfo?.nativeName || selectedLanguage}
              onExit={exitSession}
              onExport={handleExportAll}
            />
          </div>
        ) : sessionMode ? (
          /* Session mode - focused recorder */
          <div className="max-w-2xl mx-auto">
            {sessionItem ? (
              <StudioRecorder
                textKey={sessionItem.key}
                textValue={sessionItem.value}
                language={selectedLanguage}
                isRecorded={sessionItem.isRecorded}
                existingAudioUrl={existingAudioUrl}
                onSave={handleSaveRecording}
                onSkip={handleSkip}
                onDelete={handleDeleteRecording}
              />
            ) : (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun texte à enregistrer
                </p>
              </div>
            )}

            {/* Session tips */}
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground text-center">
                💡 Enregistrez et validez pour passer automatiquement au texte suivant
              </p>
            </div>
          </div>
        ) : (
          /* Normal mode - grid layout */
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
                  existingAudioUrl={existingAudioUrl}
                  onSave={handleSaveRecording}
                  onSkip={handleSkip}
                  onDelete={handleDeleteRecording}
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
        )}
      </div>

      <UnifiedBottomNav items={adminSecondaryNavItems} />
    </div>
  );
}