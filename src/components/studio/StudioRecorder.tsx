import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { AudioLevelMeter } from '@/components/shared/AudioLevelMeter';
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2, Upload, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StudioRecorderProps {
  textKey: string;
  textValue: string;
  language: string;
  isRecorded: boolean;
  existingAudioUrl?: string | null;
  onSave: (audioBlob: Blob, duration: number) => Promise<void>;
  onSkip: () => void;
  onDelete?: () => Promise<void>;
}

export function StudioRecorder({ 
  textKey, 
  textValue, 
  language, 
  isRecorded,
  existingAudioUrl,
  onSave,
  onSkip,
  onDelete
}: StudioRecorderProps) {
  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
    error,
    isSupported,
    permissionStatus,
    audioLevel,
    peakLevel,
    isClipping
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingExisting, setIsPlayingExisting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReRecord, setShowReRecord] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const existingAudioRef = useRef<HTMLAudioElement | null>(null);

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handlePlayExisting = () => {
    if (existingAudioRef.current && existingAudioUrl) {
      if (isPlayingExisting) {
        existingAudioRef.current.pause();
        existingAudioRef.current.currentTime = 0;
        setIsPlayingExisting(false);
      } else {
        existingAudioRef.current.play();
        setIsPlayingExisting(true);
      }
    }
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    
    setIsSaving(true);
    try {
      await onSave(audioBlob, duration);
      resetRecording();
      setShowReRecord(false);
    } catch (err) {
      console.error('Error saving audio:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (err) {
      console.error('Error deleting audio:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartReRecord = () => {
    setShowReRecord(true);
    resetRecording();
  };

  const handleCancelReRecord = () => {
    setShowReRecord(false);
    resetRecording();
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (existingAudioRef.current) {
      existingAudioRef.current.onended = () => setIsPlayingExisting(false);
    }
  }, [existingAudioUrl]);

  // Reset re-record mode when textKey changes
  useEffect(() => {
    setShowReRecord(false);
    resetRecording();
  }, [textKey]);

  // Show existing recording UI if recorded and not in re-record mode
  const showExistingRecording = isRecorded && existingAudioUrl && !showReRecord && !audioUrl;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
      {/* Language indicator */}
      <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <p className="text-sm text-center">
          <span className="font-medium text-primary">Texte en français</span>
          <span className="text-muted-foreground"> → </span>
          <span className="font-medium text-foreground">Enregistrer en {language === 'dioula' ? 'Dioula' : language === 'fr' ? 'Français' : language}</span>
        </p>
      </div>

      {/* Text to record */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded">
            {textKey}
          </span>
          {isRecorded && (
            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs rounded flex items-center gap-1">
              <Check className="h-3 w-3" /> Enregistré
            </span>
          )}
        </div>
        <p className="text-2xl font-medium text-foreground leading-relaxed">
          {textValue}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-center gap-2">
          <span className="font-medium">Erreur:</span> {error}
        </div>
      )}

      {/* Support warning */}
      {!isSupported && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
          L'enregistrement audio n'est pas supporté par ce navigateur.
        </div>
      )}

      {/* Permission warning */}
      {isSupported && permissionStatus === 'denied' && (
        <div className="mb-4 p-3 bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm">
          L'accès au microphone est bloqué. Veuillez autoriser l'accès dans les paramètres du navigateur.
        </div>
      )}

      {/* Existing recording playback */}
      {showExistingRecording && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Enregistrement existant
            </h4>
          </div>
          
          <audio ref={existingAudioRef} src={existingAudioUrl} />
          
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handlePlayExisting}
              className="rounded-full h-14 w-14 border-emerald-300 dark:border-emerald-700"
            >
              {isPlayingExisting ? (
                <Pause className="h-6 w-6 text-emerald-600" />
              ) : (
                <Play className="h-6 w-6 text-emerald-600" />
              )}
            </Button>
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              Cliquez pour écouter
            </span>
          </div>
        </div>
      )}

      {/* Recording visualization */}
      {!showExistingRecording && (
        <div className="flex items-center justify-center py-8">
        {isRecording ? (
            <div className="flex flex-col items-center gap-4">
              {/* Audio Level Meter */}
              <AudioLevelMeter 
                level={audioLevel}
                peakLevel={peakLevel}
                isClipping={isClipping}
                variant="wave"
                size="lg"
                showPeak={true}
              />
              
              {/* Clipping warning */}
              {isClipping && (
                <div className="flex items-center gap-2 text-destructive animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">Signal trop fort</span>
                </div>
              )}
              
              <span className="text-2xl font-mono text-primary">
                {formatDuration(duration)}
              </span>
              <span className="text-sm text-muted-foreground">
                Max: 30 secondes
              </span>
            </div>
          ) : audioUrl ? (
            <div className="flex flex-col items-center gap-4">
              <audio ref={audioRef} src={audioUrl} />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePlay}
                  className="rounded-full h-16 w-16"
                >
                  <Play className={cn("h-6 w-6", isPlaying && "text-primary")} />
                </Button>
                <span className="text-xl font-mono text-foreground">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Mic className="h-12 w-12" />
              <span>
                {showReRecord 
                  ? "Prêt à ré-enregistrer" 
                  : "Appuyez sur le bouton pour enregistrer"
                }
              </span>
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {showExistingRecording ? (
          // Controls for existing recording
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={handleStartReRecord}
              className="rounded-full gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Ré-enregistrer
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                  Supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer l'enregistrement ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. L'audio pour "{textKey}" sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="lg"
              onClick={onSkip}
              className="rounded-full"
            >
              Passer
            </Button>
          </>
        ) : !audioUrl ? (
          // Controls for new recording
          <>
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full px-8 gap-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-5 w-5" />
                  Arrêter
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  Enregistrer
                </>
              )}
            </Button>

            {showReRecord && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleCancelReRecord}
                className="rounded-full"
              >
                Annuler
              </Button>
            )}

            {!showReRecord && (
              <Button
                variant="ghost"
                size="lg"
                onClick={onSkip}
                className="rounded-full"
              >
                Passer
              </Button>
            )}
          </>
        ) : (
          // Controls after recording (preview)
          <>
            <Button
              variant="outline"
              size="lg"
              onClick={resetRecording}
              className="rounded-full gap-2"
            >
              <RotateCcw className="h-5 w-5" />
              Recommencer
            </Button>
            
            <Button
              size="lg"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Valider
                </>
              )}
            </Button>

            {showReRecord && (
              <Button
                variant="ghost"
                size="lg"
                onClick={handleCancelReRecord}
                className="rounded-full"
              >
                Annuler
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
