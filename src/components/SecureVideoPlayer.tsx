import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  SkipBack, CheckCircle, Loader2, Settings,
  RotateCcw, RotateCw, PictureInPicture2, Keyboard, HelpCircle, Check
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { getLocalVideoProgress, saveLocalVideoProgress } from '@/lib/localStorageData';

// Declare global YT types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Load YouTube IFrame API once
let ytApiLoaded = false;
let ytApiLoadPromise: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (ytApiLoaded && window.YT?.Player) return Promise.resolve();
  if (ytApiLoadPromise) return ytApiLoadPromise;
  ytApiLoadPromise = new Promise((resolve) => {
    if (window.YT?.Player) { ytApiLoaded = true; resolve(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(tag, firstScript);
    window.onYouTubeIframeAPIReady = () => { ytApiLoaded = true; resolve(); };
  });
  return ytApiLoadPromise;
}

function extractYouTubeId(url: string): string {
  if (url.includes('youtu.be')) return url.split('/').pop()?.split('?')[0] || url;
  if (url.includes('v=')) return url.split('v=')[1]?.split('&')[0] || url;
  return url;
}

const YT_COMPLETION_THRESHOLD = 0.90;
const YT_PROGRESS_SAVE_INTERVAL = 5000;

interface YouTubeCustomPlayerProps {
  videoUrl: string;
  videoId: string;
  userId: string;
  onComplete: () => void;
  initialPosition?: number;
  maxWatchedSeconds?: number;
  isLessonCompleted?: boolean;
  posterUrl?: string;
  autoPlay?: boolean;
  onThresholdMet?: () => void;
}

function YouTubeCustomPlayer({
  videoUrl, videoId, userId, onComplete,
  initialPosition = 0, maxWatchedSeconds = 0,
  isLessonCompleted = false, posterUrl, autoPlay = false, onThresholdMet,
}: YouTubeCustomPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeHolderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [highestWatched, setHighestWatched] = useState(maxWatchedSeconds);
  const [isCompleted, setIsCompleted] = useState(isLessonCompleted);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPoster, setShowPoster] = useState(!autoPlay);
  const [showIntro, setShowIntro] = useState(autoPlay);
  const [thresholdNotified, setThresholdNotified] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Advanced Player UX states
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const [rippleSide, setRippleSide] = useState<'left' | 'right' | null>(null);
  const rippleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastClickTimeRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerRipple = (side: 'left' | 'right') => {
    setRippleSide(side);
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    rippleTimerRef.current = setTimeout(() => setRippleSide(null), 500);
  };

  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();

  // Disable right-click
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  // Load progress from local device first, then remote DB
  useEffect(() => {
    const local = getLocalVideoProgress(userId, videoId);
    if (local) {
      const maxW = Math.max(local.watched_seconds || 0, local.last_position || 0, maxWatchedSeconds);
      setHighestWatched(maxW);
      if (local.is_completed) setIsCompleted(true);
    }

    if (userId && !userId.startsWith('demo-')) {
      supabase
        .from('video_progress')
        .select('watched_seconds, last_position, is_completed')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const maxW = Math.max(data.watched_seconds || 0, data.last_position || 0, maxWatchedSeconds, local?.watched_seconds || 0);
            setHighestWatched(maxW);
            if (data.is_completed) setIsCompleted(true);
          }
        })
        .catch(() => {});
    }
  }, [videoId, userId, maxWatchedSeconds]);

  // Intro splash
  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [showIntro]);

  // Initialize YouTube player imperatively
  useEffect(() => {
    if (showPoster || showIntro) return;

    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled || !iframeHolderRef.current) return;
      const ytId = extractYouTubeId(videoUrl);

      // Clean up previous instance if any
      try {
        if (playerRef.current) {
          playerRef.current.destroy?.();
          playerRef.current = null;
        }
      } catch {}

      // Clear the holder container
      if (iframeHolderRef.current) {
        iframeHolderRef.current.innerHTML = '';
      }

      // Create an imperative mount element inside iframeHolderRef
      const mountNode = document.createElement('div');
      mountNode.style.width = '100%';
      mountNode.style.height = '100%';
      iframeHolderRef.current.appendChild(mountNode);

      playerRef.current = new window.YT.Player(mountNode, {
        videoId: ytId,
        playerVars: {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          disablekb: 1,
          fs: 0,
          playsinline: 1,
          showinfo: 0,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            if (cancelled) return;
            setPlayerReady(true);
            setDuration(e.target.getDuration());
            setIsLoading(false);
            if (initialPosition > 0) e.target.seekTo(initialPosition, true);
            if (autoPlay) {
              e.target.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (e: any) => {
            if (cancelled) return;
            if (e.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setIsLoading(false);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (e.data === window.YT.PlayerState.BUFFERING) {
              setIsLoading(true);
            } else if (e.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setIsCompleted(true);
              saveProgress(playerRef.current?.getDuration() || duration, true);
              onComplete();
            }
          },
          onError: () => {
            setIsLoading(false);
          },
        },
      });
    }).catch(() => {
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      try {
        if (playerRef.current) {
          playerRef.current.destroy?.();
          playerRef.current = null;
        }
      } catch {}
      if (iframeHolderRef.current) {
        iframeHolderRef.current.innerHTML = '';
      }
    };
  }, [showPoster, showIntro, videoUrl]);

  // Poll time updates
  useEffect(() => {
    if (!playerReady || !isPlaying) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p?.getCurrentTime) return;
      const ct = p.getCurrentTime();
      setCurrentTime(ct);
      if (ct > highestWatched) setHighestWatched(ct);

      const dur = p.getDuration();
      if (dur > 0 && ct / dur >= YT_COMPLETION_THRESHOLD && !thresholdNotified) {
        setThresholdNotified(true);
        onThresholdMet?.();
      }

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveProgress(Math.max(ct, highestWatched), isCompleted);
      }, YT_PROGRESS_SAVE_INTERVAL);
    }, 500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [playerReady, isPlaying, highestWatched, thresholdNotified, isCompleted]);

  const saveProgress = useCallback(async (seconds: number, completed: boolean) => {
    const dur = playerRef.current?.getDuration?.() || duration;
    const percent = dur > 0 ? Math.round((seconds / dur) * 100) : 0;

    // 1. Always save to local device
    saveLocalVideoProgress(userId, videoId, {
      watched_seconds: Math.round(Math.max(seconds, highestWatched)),
      last_position: Math.round(seconds),
      progress_percent: Math.min(percent, 100),
      is_completed: completed,
    });

    // 2. Sync to Supabase if real user
    if (userId && !userId.startsWith('demo-')) {
      try {
        await supabase.from('video_progress').upsert({
          user_id: userId,
          video_id: videoId,
          progress_percent: Math.min(percent, 100),
          is_completed: completed,
          last_watched_at: new Date().toISOString(),
          watched_seconds: Math.round(Math.max(seconds, highestWatched)),
          last_position: Math.round(seconds),
        }, { onConflict: 'user_id,video_id' });
      } catch (err) {
        console.warn('Supabase save error (saved locally):', err);
      }
    }
  }, [userId, videoId, duration, highestWatched]);

  const togglePlay = () => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) { p.pauseVideo(); } else { p.playVideo(); }
  };

  const handleSeek = (value: number[]) => {
    const p = playerRef.current;
    if (!p) return;
    const seekTo = Math.max(0, Math.min(value[0], duration || Infinity));
    p.seekTo(seekTo, true);
    setCurrentTime(seekTo);
    if (seekTo > highestWatched) setHighestWatched(seekTo);
    saveProgress(seekTo, isCompleted);
  };

  const skipBack = () => {
    const p = playerRef.current;
    if (!p) return;
    const ct = p.getCurrentTime?.() || currentTime || 0;
    const target = Math.max(0, ct - 10);
    p.seekTo(target, true);
    setCurrentTime(target);
    triggerRipple('left');
    showHud('-10s');
  };

  const skipForward = () => {
    const p = playerRef.current;
    if (!p) return;
    const ct = p.getCurrentTime?.() || currentTime || 0;
    const target = Math.min(duration || Infinity, ct + 10);
    p.seekTo(target, true);
    setCurrentTime(target);
    if (target > highestWatched) setHighestWatched(target);
    triggerRipple('right');
    showHud('+10s');
  };

  const toggleMute = () => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) { p.unMute(); setIsMuted(false); } else { p.mute(); setIsMuted(true); }
  };

  const changeVolume = (value: number[]) => {
    const p = playerRef.current;
    if (!p) return;
    p.setVolume(value[0]);
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const setSpecificSpeed = (rate: number) => {
    const p = playerRef.current;
    if (!p) return;
    p.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    showHud(`${rate}x`);
  };

  const changePlaybackRate = () => {
    const p = playerRef.current;
    if (!p) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = rates.indexOf(playbackRate);
    const next = rates[(idx + 1) % rates.length];
    p.setPlaybackRate(next);
    setPlaybackRate(next);
    showHud(`${next}x`);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const stateRef = useRef({ isPlaying, isCompleted, highestWatched, volume, playbackRate });
  useEffect(() => {
    stateRef.current = { isPlaying, isCompleted, highestWatched, volume, playbackRate };
  }, [isPlaying, isCompleted, highestWatched, volume, playbackRate]);

  const showHud = useCallback((msg: string) => {
    setHudMessage(msg);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setHudMessage(null), 1000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const p = playerRef.current;
      if (!p) return;

      const { isPlaying, isCompleted, highestWatched, volume, playbackRate } = stateRef.current;
      const key = e.key.toLowerCase();

      if (e.key === ' ' || key === 'k') {
        e.preventDefault();
        if (isPlaying) { p.pauseVideo(); showHud('Paused'); }
        else { p.playVideo(); showHud('Playing'); }
      }
      else if (e.key === 'ArrowLeft' || key === 'j') {
        e.preventDefault();
        skipBack();
      }
      else if (e.key === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        skipForward();
      }
      else if (key === 'm') {
        e.preventDefault();
        if (p.isMuted()) { p.unMute(); setIsMuted(false); showHud('Unmuted'); }
        else { p.mute(); setIsMuted(true); showHud('Muted'); }
      }
      else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const v = Math.min(100, volume + 10);
        p.setVolume(v);
        setVolume(v);
        setIsMuted(v === 0);
        showHud(`Volume ${v}%`);
      }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const v = Math.max(0, volume - 10);
        p.setVolume(v);
        setVolume(v);
        setIsMuted(v === 0);
        showHud(`Volume ${v}%`);
      }
      else if (e.key === '>' || (e.shiftKey && e.key === '.')) {
        e.preventDefault();
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const idx = rates.indexOf(playbackRate);
        if (idx < rates.length - 1) {
          const next = rates[idx + 1];
          p.setPlaybackRate(next);
          setPlaybackRate(next);
          showHud(`Speed ${next}x`);
        }
      }
      else if (e.key === '<' || (e.shiftKey && e.key === ',')) {
        e.preventDefault();
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
        const idx = rates.indexOf(playbackRate);
        if (idx > 0) {
          const next = rates[idx - 1];
          p.setPlaybackRate(next);
          setPlaybackRate(next);
          showHud(`Speed ${next}x`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHud]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => { if (isPlaying) setShowControls(false); }, 3000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const startFromPoster = () => {
    setShowPoster(false);
  };

  if (showPoster) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group" onClick={startFromPoster} onContextMenu={e => e.preventDefault()}>
        {posterUrl ? <img src={posterUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-950" />}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative aspect-video bg-black rounded-lg overflow-hidden select-none" onMouseMove={handleMouseMove} onContextMenu={e => e.preventDefault()}>
      {/* Logo Intro */}
      {showIntro && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center animate-pulse">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-3 dark:invert" />
            <p className="text-white/80 text-sm font-medium">Astropixel Academy</p>
          </div>
        </div>
      )}

      {/* YouTube Player (hidden controls) */}
      <div ref={iframeHolderRef} className="w-full h-full absolute inset-0 pointer-events-none" />

      {/* Overlay to capture clicks (double click to seek, single click to play/pause) */}
      <div className="absolute inset-0 z-10" onClick={handlePlayerAreaClick} />

      {/* Skip Ripples */}
      {rippleSide === 'left' && (
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 bg-black/75 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
          <RotateCcw className="w-6 h-6 text-white" />
          <span className="text-xs font-extrabold text-white">-10s</span>
        </div>
      )}
      {rippleSide === 'right' && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 bg-black/75 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 pointer-events-none animate-in fade-in zoom-in-90 duration-200">
          <RotateCw className="w-6 h-6 text-white" />
          <span className="text-xs font-extrabold text-white">+10s</span>
        </div>
      )}

      {/* Center Play Button */}
      {!isPlaying && !isLoading && !showIntro && playerReady && (
        <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center z-20 group">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
          </div>
        </button>
      )}

      {/* Loading */}
      {isLoading && !showIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Controls */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 md:p-4 transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="mb-2 md:mb-3 relative group/slider"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setHoverPercent(pct * 100);
            setHoverTime(pct * (duration || 0));
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          {hoverTime !== null && (
            <div 
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 border border-white/20 text-[10px] text-white font-mono pointer-events-none -translate-x-1/2 shadow-lg z-50"
              style={{ left: `${hoverPercent}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="cursor-pointer" />
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-white">
          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={togglePlay} title={isPlaying ? "Pause (Space/K)" : "Play (Space/K)"}>
            {isPlaying ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 relative group" onClick={skipBack} title="Rewind 10s (J/←)">
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="absolute -bottom-1 text-[8px] font-bold text-white/70">10</span>
          </Button>

          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 relative group" onClick={skipForward} title="Forward 10s (L/→)">
            <RotateCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="absolute -bottom-1 text-[8px] font-bold text-white/70">10</span>
          </Button>

          <span className="text-[10px] md:text-xs tabular-nums ml-1">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="flex-1" />

          {/* Speed Selector Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 md:h-7 text-[10px] md:text-xs text-white hover:bg-white/20 px-1.5 md:px-2 font-bold" 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback Speed"
            >
              {playbackRate}x
            </Button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-md border border-white/20 rounded-xl py-1 min-w-[110px] z-50 shadow-2xl overflow-hidden">
                <p className="px-3 py-1 text-[10px] text-white/50 font-bold uppercase tracking-wider">Speed</p>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSpecificSpeed(rate)}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-white/15 transition-colors ${
                      playbackRate === rate ? 'text-primary font-bold bg-primary/10' : 'text-white/80'
                    }`}
                  >
                    <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
                    {playbackRate === rate && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </Button>
            <div className="w-16 hidden md:block">
              <Slider value={[isMuted ? 0 : volume]} max={100} step={1} onValueChange={changeVolume} />
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 md:h-8 md:w-8 text-white/80 hover:text-white hover:bg-white/20" 
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={toggleFullscreen} title="Fullscreen (F)">
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </Button>
        </div>
      </div>

      {/* HUD Message */}
      {hudMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-lg font-medium z-40 pointer-events-none animate-in fade-in zoom-in duration-200">
          {hudMessage}
        </div>
      )}

      {/* Threshold Indicator */}
      {thresholdNotified && !isCompleted && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1 animate-bounce z-30">
          <CheckCircle className="w-3 h-3" /> Ready to complete!
        </div>
      )}
      {isCompleted && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 z-30">
          <CheckCircle className="w-3 h-3" /> Completed
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Keyboard className="w-5 h-5 text-primary" />
              ভিডিও প্লেয়ার কীবোর্ড শর্টকাট
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ক্লাস দেখার অভিজ্ঞতা দ্রুত ও সুবিধাজনক করতে নিচের শর্টকাটগুলো ব্যবহার করুন:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>প্লে / পজ</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">Space / K</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>১০ সেকেন্ড পেছনে যান (Rewind)</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">← বা J</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>১০ সেকেন্ড সামনে যান (Forward)</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">→ বা L</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>সাউন্ড বাড়ানো / কমানো</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">↑ / ↓</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>স্পিড বাড়ানো / কমানো</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">&gt; / &lt;</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>মিউট / আনমিউট</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">M</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>ফুলস্ক্রিন টগল</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">F</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>স্ক্রিনে ডাবল ক্লিক</span>
              <span className="text-white/60 font-semibold">বামে (-10s) ও ডানে (+10s)</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
interface SecureVideoPlayerProps {
  videoUrl: string;
  videoType?: string;
  videoId: string;
  userId: string;
  onComplete: () => void;
  initialPosition?: number;
  maxWatchedSeconds?: number;
  isLessonCompleted?: boolean;
  posterUrl?: string;
  autoPlay?: boolean;
  onThresholdMet?: () => void;
}

const COMPLETION_THRESHOLD = 0.90; // 90%
const PROGRESS_SAVE_INTERVAL = 5000; // 5 seconds

export default function SecureVideoPlayer({
  videoUrl,
  videoType,
  videoId,
  userId,
  onComplete,
  initialPosition = 0,
  maxWatchedSeconds = 0,
  isLessonCompleted = false,
  posterUrl,
  autoPlay = false,
  onThresholdMet,
}: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [highestWatched, setHighestWatched] = useState(maxWatchedSeconds);
  const [isCompleted, setIsCompleted] = useState(isLessonCompleted);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showPoster, setShowPoster] = useState(!autoPlay);
  const [showIntro, setShowIntro] = useState(autoPlay);
  const [thresholdNotified, setThresholdNotified] = useState(false);
  const [showResMenu, setShowResMenu] = useState(false);
  const [selectedRes, setSelectedRes] = useState('auto');
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout>>();
  const progressSaveTimer = useRef<ReturnType<typeof setTimeout>>();

  // Advanced Player UX states
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const [rippleSide, setRippleSide] = useState<'left' | 'right' | null>(null);
  const rippleTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const lastClickTimeRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerRipple = (side: 'left' | 'right') => {
    setRippleSide(side);
    if (rippleTimerRef.current) clearTimeout(rippleTimerRef.current);
    rippleTimerRef.current = setTimeout(() => setRippleSide(null), 500);
  };

  // Disable right-click
  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', handler);
    return () => document.removeEventListener('contextmenu', handler);
  }, []);

  // Load existing progress from local storage first, then DB
  useEffect(() => {
    const local = getLocalVideoProgress(userId, videoId);
    if (local) {
      const maxW = Math.max(local.watched_seconds || 0, local.last_position || 0, maxWatchedSeconds);
      setHighestWatched(maxW);
      if (local.is_completed) {
        setIsCompleted(true);
      }
    }

    if (userId && !userId.startsWith('demo-')) {
      supabase
        .from('video_progress')
        .select('watched_seconds, last_position, is_completed')
        .eq('user_id', userId)
        .eq('video_id', videoId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            const maxW = Math.max(data.watched_seconds || 0, data.last_position || 0, maxWatchedSeconds, local?.watched_seconds || 0);
            setHighestWatched(maxW);
            if (data.is_completed) {
              setIsCompleted(true);
            }
          }
        })
        .catch(() => {});
    }
  }, [videoId, userId, maxWatchedSeconds]);

  // Intro splash (3s) then auto-play
  useEffect(() => {
    if (!showIntro) return;
    const timer = setTimeout(() => {
      setShowIntro(false);
      if (autoPlay && videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [autoPlay, showIntro]);

  // Set initial position
  useEffect(() => {
    if (videoRef.current && initialPosition > 0 && !showIntro && !showPoster) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition, showIntro, showPoster]);

  // Save progress to local storage and DB
  const saveProgress = useCallback(async (seconds: number, completed: boolean) => {
    const percent = duration > 0 ? Math.round((seconds / duration) * 100) : 0;

    // 1. Save locally
    saveLocalVideoProgress(userId, videoId, {
      watched_seconds: Math.round(Math.max(seconds, highestWatched)),
      last_position: Math.round(seconds),
      progress_percent: Math.min(percent, 100),
      is_completed: completed,
    });

    // 2. Sync to Supabase if real user
    if (userId && !userId.startsWith('demo-')) {
      try {
        await supabase.from('video_progress').upsert({
          user_id: userId,
          video_id: videoId,
          progress_percent: Math.min(percent, 100),
          is_completed: completed,
          last_watched_at: new Date().toISOString(),
          watched_seconds: Math.round(Math.max(seconds, highestWatched)),
          last_position: Math.round(seconds),
        }, { onConflict: 'user_id,video_id' });
      } catch (err) {
        console.warn('Supabase save error (saved locally):', err);
      }
    }
  }, [userId, videoId, duration, highestWatched]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setCurrentTime(video.currentTime);
    
    if (video.currentTime > highestWatched) {
      setHighestWatched(video.currentTime);
    }

    // Check 90% threshold
    if (duration > 0 && video.currentTime / duration >= COMPLETION_THRESHOLD && !thresholdNotified) {
      setThresholdNotified(true);
      onThresholdMet?.();
    }

    // Periodic save (every 5s)
    if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current);
    progressSaveTimer.current = setTimeout(() => {
      saveProgress(Math.max(video.currentTime, highestWatched), isCompleted);
    }, PROGRESS_SAVE_INTERVAL);
  };

  // Unrestricted seek - students can navigate freely
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTo = value[0];
    video.currentTime = seekTo;
    setCurrentTime(seekTo);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsCompleted(true);
    saveProgress(duration, true);
    onComplete();
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
      showHud('Playing');
    } else {
      video.pause();
      setIsPlaying(false);
      showHud('Paused');
    }
  };

  const startFromPoster = () => {
    setShowPoster(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 100);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    showHud(video.muted ? 'Muted' : 'Unmuted');
  };

  const changeVolume = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value[0];
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const changePlaybackRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const idx = rates.indexOf(playbackRate);
    const next = rates[(idx + 1) % rates.length];
    video.playbackRate = next;
    setPlaybackRate(next);
    showHud(`Speed ${next}x`);
  };

  const setSpecificSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    showHud(`Speed ${rate}x`);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
    }
  };

  const skipBack = () => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.max(0, video.currentTime - 10);
    video.currentTime = target;
    setCurrentTime(target);
    triggerRipple('left');
    showHud('-10s');
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    const target = Math.min(duration || video.duration || 99999, video.currentTime + 10);
    video.currentTime = target;
    setCurrentTime(target);
    triggerRipple('right');
    showHud('+10s');
  };

  const [hudMessage, setHudMessage] = useState<string | null>(null);
  const hudTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const stateRef = useRef({ isPlaying, isCompleted, highestWatched, volume, playbackRate, duration });
  useEffect(() => {
    stateRef.current = { isPlaying, isCompleted, highestWatched, volume, playbackRate, duration };
  }, [isPlaying, isCompleted, highestWatched, volume, playbackRate, duration]);

  const showHud = useCallback((msg: string) => {
    setHudMessage(msg);
    if (hudTimerRef.current) clearTimeout(hudTimerRef.current);
    hudTimerRef.current = setTimeout(() => setHudMessage(null), 1000);
  }, []);

  // Screen click handler for single click (play/pause) vs double click (skip -10s / +10s)
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.player-controls-bar')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const now = Date.now();
    const timeSinceLast = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (timeSinceLast < 300) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      if (clickX < width * 0.35) {
        skipBack();
      } else if (clickX > width * 0.65) {
        skipForward();
      } else {
        togglePlay();
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        togglePlay();
      }, 250);
    }
  };

  // Timeline hover preview
  const handleTimelineHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = (x / rect.width) * 100;
    const previewTime = (x / rect.width) * duration;
    setHoverTime(previewTime);
    setHoverPercent(pct);
  };

  const handleTimelineMouseLeave = () => {
    setHoverTime(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      const { isPlaying, volume, playbackRate, duration } = stateRef.current;
      const key = e.key.toLowerCase();

      if (e.key === ' ' || key === 'k') {
        e.preventDefault();
        if (isPlaying) { video.pause(); setIsPlaying(false); showHud('Paused'); }
        else { video.play(); setIsPlaying(true); showHud('Playing'); }
      }
      else if (e.key === 'ArrowLeft' || key === 'j') {
        e.preventDefault();
        const target = Math.max(0, video.currentTime - 10);
        video.currentTime = target;
        setCurrentTime(target);
        triggerRipple('left');
        showHud('-10s');
      }
      else if (e.key === 'ArrowRight' || key === 'l') {
        e.preventDefault();
        const target = Math.min(duration || video.duration || 99999, video.currentTime + 10);
        video.currentTime = target;
        setCurrentTime(target);
        triggerRipple('right');
        showHud('+10s');
      }
      else if (key === 'm') {
        e.preventDefault();
        video.muted = !video.muted;
        setIsMuted(video.muted);
        showHud(video.muted ? 'Muted' : 'Unmuted');
      }
      else if (key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const v = Math.min(1, volume + 0.1);
        video.volume = v;
        setVolume(v);
        setIsMuted(v === 0);
        showHud(`Volume ${Math.round(v * 100)}%`);
      }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const v = Math.max(0, volume - 0.1);
        video.volume = v;
        setVolume(v);
        setIsMuted(v === 0);
        showHud(`Volume ${Math.round(v * 100)}%`);
      }
      else if (e.key === '>' || (e.shiftKey && e.key === '.')) {
        e.preventDefault();
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const idx = rates.indexOf(playbackRate);
        if (idx < rates.length - 1) {
          const next = rates[idx + 1];
          video.playbackRate = next;
          setPlaybackRate(next);
          showHud(`Speed ${next}x`);
        }
      }
      else if (e.key === '<' || (e.shiftKey && e.key === ',')) {
        e.preventDefault();
        const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const idx = rates.indexOf(playbackRate);
        if (idx > 0) {
          const next = rates[idx - 1];
          video.playbackRate = next;
          setPlaybackRate(next);
          showHud(`Speed ${next}x`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHud]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const resolutions = [
    { label: 'Auto', value: 'auto' },
    { label: '1080p', value: '1080' },
    { label: '720p', value: '720' },
    { label: '480p', value: '480' },
    { label: '360p', value: '360' },
  ];

  const getVideoUrl = () => {
    if (selectedRes === 'auto' || !videoUrl.includes('cloudinary')) return videoUrl;
    return videoUrl.replace('/upload/', `/upload/q_auto,h_${selectedRes}/`);
  };

  const changeResolution = (res: string) => {
    const video = videoRef.current;
    const time = video?.currentTime || 0;
    const wasPlaying = !video?.paused;
    setSelectedRes(res);
    setShowResMenu(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        if (wasPlaying) videoRef.current.play();
      }
    }, 100);
  };

  // YouTube custom player using IFrame API
  if (videoType === 'youtube') {
    return (
      <YouTubeCustomPlayer
        videoUrl={videoUrl}
        videoId={videoId}
        userId={userId}
        onComplete={onComplete}
        initialPosition={initialPosition}
        maxWatchedSeconds={maxWatchedSeconds}
        isLessonCompleted={isLessonCompleted}
        posterUrl={posterUrl}
        autoPlay={autoPlay}
        onThresholdMet={onThresholdMet}
      />
    );
  }

  // Vimeo iframe fallback for legacy videos
  if (videoType === 'vimeo') {
    const vimeoId = videoUrl.split('/').pop();
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden" onContextMenu={e => e.preventDefault()}>
        <iframe src={`https://player.vimeo.com/video/${vimeoId}`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  // Poster/thumbnail screen
  if (showPoster) {
    return (
      <div
        className="relative aspect-video bg-black rounded-lg overflow-hidden cursor-pointer group"
        onClick={startFromPoster}
        onContextMenu={e => e.preventDefault()}
      >
        {posterUrl ? (
          <img src={posterUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-950" />
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onClick={handleScreenClick}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Logo Intro Splash */}
      {showIntro && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center pointer-events-none">
          <div className="text-center animate-pulse">
            <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto mb-3 dark:invert" />
            <p className="text-white/80 text-sm font-medium">Astropixel Academy</p>
          </div>
        </div>
      )}

      <video
        ref={videoRef}
        src={getVideoUrl()}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
          }
        }}
        onEnded={handleEnded}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        controlsList="nodownload"
        playsInline
      />

      {/* Double Tap / Double Click Ripples */}
      {rippleSide === 'left' && (
        <div className="absolute inset-y-0 left-0 w-1/3 bg-white/10 flex items-center justify-center pointer-events-none z-30 animate-in fade-in duration-150">
          <div className="flex flex-col items-center gap-1 text-white bg-black/60 px-4 py-3 rounded-full backdrop-blur-sm">
            <RotateCcw className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-bold font-mono">-10s</span>
          </div>
        </div>
      )}
      {rippleSide === 'right' && (
        <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10 flex items-center justify-center pointer-events-none z-30 animate-in fade-in duration-150">
          <div className="flex flex-col items-center gap-1 text-white bg-black/60 px-4 py-3 rounded-full backdrop-blur-sm">
            <RotateCw className="w-6 h-6 animate-pulse" />
            <span className="text-xs font-bold font-mono">+10s</span>
          </div>
        </div>
      )}

      {/* Center Play Button (When Paused) */}
      {!isPlaying && !isLoading && !showIntro && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
            <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && !showIntro && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-20 pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {/* Controls Bar */}
      <div className={`player-controls-bar absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 md:p-4 transition-opacity duration-300 z-30 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {/* Seekbar with Hover Timestamp Preview */}
        <div 
          className="mb-2 md:mb-3 relative group/slider"
          onMouseMove={handleTimelineHover}
          onMouseLeave={handleTimelineMouseLeave}
        >
          {hoverTime !== null && (
            <div 
              className="absolute -top-7 px-2 py-0.5 rounded bg-black/90 text-white border border-white/20 text-[10px] font-mono pointer-events-none transform -translate-x-1/2 z-40 whitespace-nowrap shadow-lg"
              style={{ left: `${hoverPercent}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          <Slider 
            value={[currentTime]} 
            max={duration || 100} 
            step={0.1} 
            onValueChange={handleSeek} 
            className="cursor-pointer" 
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-white">
          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={togglePlay} title="Play/Pause (Space)">
            {isPlaying ? <Pause className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Play className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </Button>

          {/* Dedicated Rewind & Forward 10s */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 relative" 
            onClick={skipBack}
            title="Rewind 10s (← বা J)"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="absolute text-[8px] font-bold bottom-1">10</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20 relative" 
            onClick={skipForward}
            title="Forward 10s (→ বা L)"
          >
            <RotateCw className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="absolute text-[8px] font-bold bottom-1">10</span>
          </Button>

          <span className="text-[10px] md:text-xs tabular-nums text-white/90">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex-1" />

          {/* Resolution Selector */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="h-6 md:h-7 text-[10px] md:text-xs text-white hover:bg-white/20 px-1.5 md:px-2 gap-1" onClick={() => setShowResMenu(!showResMenu)}>
              <Settings className="w-3 h-3" />
              {selectedRes === 'auto' ? 'Auto' : `${selectedRes}p`}
            </Button>
            {showResMenu && (
              <div className="absolute bottom-full right-0 mb-1 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg py-1 min-w-[100px] z-50">
                {resolutions.map(res => (
                  <button key={res.value} onClick={() => changeResolution(res.value)}
                    className={`w-full px-3 py-1.5 text-xs text-left hover:bg-white/10 ${selectedRes === res.value ? 'text-primary font-semibold' : 'text-white/80'}`}>
                    {res.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Playback Speed Popover Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 md:h-7 text-[10px] md:text-xs text-white hover:bg-white/20 px-1.5 md:px-2 font-bold" 
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              title="Playback Speed"
            >
              {playbackRate}x
            </Button>
            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-md border border-white/20 rounded-xl py-1 min-w-[110px] z-50 shadow-2xl overflow-hidden">
                <p className="px-3 py-1 text-[10px] text-white/50 font-bold uppercase tracking-wider">Speed</p>
                {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSpecificSpeed(rate)}
                    className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between hover:bg-white/15 transition-colors ${
                      playbackRate === rate ? 'text-primary font-bold bg-primary/10' : 'text-white/80'
                    }`}
                  >
                    <span>{rate === 1 ? '1x (Normal)' : `${rate}x`}</span>
                    {playbackRate === rate && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </Button>
            <div className="w-16 hidden md:block">
              <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={changeVolume} />
            </div>
          </div>

          {/* Picture-in-Picture */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 md:h-8 md:w-8 text-white/80 hover:text-white hover:bg-white/20" 
            onClick={togglePiP}
            title="Picture in Picture"
          >
            <PictureInPicture2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>

          {/* Keyboard Shortcuts Help */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 md:h-8 md:w-8 text-white/80 hover:text-white hover:bg-white/20" 
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </Button>

          {/* Fullscreen */}
          <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-white hover:bg-white/20" onClick={toggleFullscreen} title="Fullscreen (F)">
            {isFullscreen ? <Minimize className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />}
          </Button>
        </div>
      </div>

      {/* HUD Message */}
      {hudMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-lg font-medium z-40 pointer-events-none animate-in fade-in zoom-in duration-200">
          {hudMessage}
        </div>
      )}

      {/* Threshold Indicator */}
      {thresholdNotified && !isCompleted && (
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-1 animate-bounce z-30">
          <CheckCircle className="w-3 h-3" /> Ready to complete!
        </div>
      )}

      {isCompleted && (
        <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 z-30">
          <CheckCircle className="w-3 h-3" /> Completed
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogContent className="sm:max-w-md bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Keyboard className="w-5 h-5 text-primary" />
              ভিডিও প্লেয়ার কীবোর্ড শর্টকাট
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              ক্লাস দেখার অভিজ্ঞতা দ্রুত ও সুবিধাজনক করতে নিচের শর্টকাটগুলো ব্যবহার করুন:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>প্লে / পজ</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">Space / K</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>১০ সেকেন্ড পেছনে যান (Rewind)</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">← বা J</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>১০ সেকেন্ড সামনে যান (Forward)</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">→ বা L</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>সাউন্ড বাড়ানো / কমানো</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">↑ / ↓</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>স্পিড বাড়ানো / কমানো</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">&gt; / &lt;</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>মিউট / আনমিউট</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">M</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>ফুলস্ক্রিন টগল</span>
              <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-primary">F</kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>স্ক্রিনে ডাবল ক্লিক</span>
              <span className="text-white/60 font-semibold">বামে (-10s) ও ডানে (+10s)</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
