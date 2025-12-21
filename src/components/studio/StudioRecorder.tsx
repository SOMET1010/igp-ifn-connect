import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Mic, Square, Play, RotateCcw, Check, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StudioRecorderProps {
  textKey: string;
  textValue: string;
  language: string;
  isRecorded: boolean;
  onSave: (audioBlob: Blob, duration: number) => Promise<void>;
  onSkip: () => void;
}

export function StudioRecorder({ 
  textKey, 
  textValue, 
  language, 
  isRecorded,
  onSave,
  onSkip 
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
  const [isSaving, setIsSaving] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleSave = async () => {
    if (!audioBlob) return;
    
    setIsSaving(true);
    try {
      await onSave(audioBlob, duration);
      resetRecording();
    } catch (err) {
      console.error('Error saving audio:', err);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, [audioUrl]);

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

      {/* Recording visualization */}
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
            <span>Appuyez sur le bouton pour enregistrer</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {!audioUrl ? (
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
        ) : (
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
          </>
        )}

        <Button
          variant="ghost"
          size="lg"
          onClick={onSkip}
          className="rounded-full"
        >
          Passer
        </Button>
      </div>
    </div>
  );
}
