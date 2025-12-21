import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Square, Play, Pause, RotateCcw, Check, Loader2, Upload, Trash2, RefreshCw } from 'lucide-react';
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
    error
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
        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
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
              {/* Animated wave */}
              <div className="flex items-center gap-1 h-16">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary rounded-full animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 40}px`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.5s'
                    }}
                  />
                ))}
              </div>
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
