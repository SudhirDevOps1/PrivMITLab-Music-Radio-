import { useState, useRef, useCallback, useEffect } from 'react';
import type { Song, PlayerState } from '@/types';
import { getYTPlayer, PlayerState as YTState } from '@/utils/youtubePlayer';
import {
  startBackgroundKeepAlive,
  stopBackgroundKeepAlive,
  updateMediaSessionMetadata,
  updateMediaSessionPlayback,
  updateMediaSessionPosition,
} from '@/utils/mediaSession';

const DEFAULT_STATE: PlayerState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  isMuted: false,
  repeatMode: 'none',
  isShuffle: false,
};

export function usePlayer(queue: Song[]) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(DEFAULT_STATE);

  const currentIndexRef = useRef(-1);
  const queueRef = useRef<Song[]>(queue);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(playerState);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Auto-next guards ─────────────────────────────────────────
  // Prevents multiple next() calls for same song end
  const endedHandledRef = useRef(false);
  // Track videoId to detect song changes
  const lastVideoIdRef = useRef<string | null>(null);
  // Track how many polls we've been at end position
  const endPollCountRef = useRef(0);
  // Track last currentTime to detect stuck playback
  const lastCtRef = useRef(-1);
  const stuckCountRef = useRef(0);

  // Refs for media session handlers
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const seekRef = useRef<(seconds: number) => void>(() => {});

  // Sync refs
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // Smart state updater
  const updateState = useCallback((patch: Partial<PlayerState>) => {
    setPlayerState((prev) => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  // ─── Polling ────────────────────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();

    intervalRef.current = setInterval(() => {
      const yt = getYTPlayer();
      if (!yt) return;

      try {
        const ytState = yt.getPlayerState();
        const ct = Math.floor(yt.getCurrentTime() || 0);
        const dur = Math.floor(yt.getDuration() || 0);
        const playing = ytState === YTState.PLAYING || ytState === YTState.BUFFERING;

        // Update state if changed
        const prev = stateRef.current;
        if (prev.isPlaying !== playing || prev.currentTime !== ct || prev.duration !== dur) {
          updateState({ isPlaying: playing, currentTime: ct, duration: dur });
          updateMediaSessionPosition(ct, dur);
          updateMediaSessionPlayback(playing);
        }

        // ─── AUTO-NEXT: 3 Detection Methods ──────────────────

        // Guard: already handled this song's end
        if (endedHandledRef.current) return;

        // Method 1: YouTube ENDED state
        const isEnded = ytState === YTState.ENDED;

        // Method 2: currentTime reached duration (some videos never report ENDED)
        const isFinished = dur > 0 && ct >= dur - 1 && !playing && ytState !== YTState.BUFFERING;

        // Method 3: Stuck detection — same position for 5+ polls near end
        // (handles videos that freeze at end without reporting ENDED)
        if (ct === lastCtRef.current && ct > 0 && dur > 0) {
          stuckCountRef.current++;
        } else {
          stuckCountRef.current = 0;
        }
        lastCtRef.current = ct;

        const isStuckAtEnd = dur > 0 && ct >= dur - 3 && stuckCountRef.current >= 10 && !playing;

        // Combine all methods
        const shouldAdvance = isEnded || isFinished || isStuckAtEnd;

        if (shouldAdvance) {
          endPollCountRef.current++;

          // Require 2 consecutive detections to avoid false triggers
          if (endPollCountRef.current >= 2) {
            endedHandledRef.current = true;
            endPollCountRef.current = 0;
            stuckCountRef.current = 0;

            console.log(`[Player] Song ended (method: ${isEnded ? 'ENDED' : isFinished ? 'FINISHED' : 'STUCK'}), advancing...`);

            const st = stateRef.current;
            if (st.repeatMode === 'one') {
              try {
                yt.seekTo(0, true);
                yt.playVideo();
                endedHandledRef.current = false;
              } catch {}
              updateState({ isPlaying: true, currentTime: 0 });
            } else {
              nextRef.current();
            }
          }
        } else {
          // Reset poll count if not at end
          endPollCountRef.current = 0;
        }

      } catch (e) {
        // YT not ready — ignore
      }
    }, 500);
  }, [stopPolling, updateState]);

  // ─── Media Session: Register handlers ONCE ─────────────────────
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    try { navigator.mediaSession.setActionHandler('play', () => {
      const yt = getYTPlayer();
      if (yt) { try { yt.playVideo(); updateState({ isPlaying: true }); } catch {} }
    }); } catch {}

    try { navigator.mediaSession.setActionHandler('pause', () => {
      const yt = getYTPlayer();
      if (yt) { try { yt.pauseVideo(); updateState({ isPlaying: false }); } catch {} }
    }); } catch {}

    try { navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current()); } catch {}
    try { navigator.mediaSession.setActionHandler('previoustrack', () => prevRef.current()); } catch {}

    try { navigator.mediaSession.setActionHandler('seekto', (details: any) => {
      if (details.seekTime != null) seekRef.current(details.seekTime);
    }); } catch {}

    return () => {
      try { navigator.mediaSession.setActionHandler('play', null); } catch {}
      try { navigator.mediaSession.setActionHandler('pause', null); } catch {}
      try { navigator.mediaSession.setActionHandler('nexttrack', null); } catch {}
      try { navigator.mediaSession.setActionHandler('previoustrack', null); } catch {}
      try { navigator.mediaSession.setActionHandler('seekto', null); } catch {}
    };
  }, [updateState]);

  // ─── Media Session: Update metadata when song changes ──────────
  useEffect(() => {
    if (currentSong) {
      updateMediaSessionMetadata(currentSong);
    }
  }, [currentSong]);

  // ─── Background Keep-Alive ─────────────────────────────────────
  useEffect(() => {
    if (currentSong && playerState.isPlaying) {
      startBackgroundKeepAlive(currentSong);
    } else {
      stopBackgroundKeepAlive();
    }
    return () => stopBackgroundKeepAlive();
  }, [currentSong, playerState.isPlaying]);

  // ─── Core Controls ─────────────────────────────────────────────
  const playSong = useCallback((song: Song, q?: Song[]) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const currentQueue = q || queueRef.current;
    const idx = currentQueue.findIndex((s) => s.videoId === song.videoId);
    currentIndexRef.current = idx >= 0 ? idx : 0;

    // ─── Reset ALL auto-next guards for new song ──────────
    endedHandledRef.current = false;
    lastVideoIdRef.current = song.videoId;
    endPollCountRef.current = 0;
    lastCtRef.current = -1;
    stuckCountRef.current = 0;

    setCurrentSong(song);
    updateMediaSessionMetadata(song);

    const loadVideo = (yt: ReturnType<typeof getYTPlayer>) => {
      try {
        yt.loadVideoById(song.videoId);
        try { yt.setVolume(stateRef.current.volume); } catch {}
        try {
          if (stateRef.current.isMuted) yt.mute();
          else if (yt.isMuted()) yt.unMute();
        } catch {}
        updateState({ isPlaying: true, currentTime: 0, duration: 0 });
        startPolling();
      } catch (e) {
        console.error('[Player] loadVideoById failed:', e);
      }
    };

    const yt = getYTPlayer();
    if (yt) {
      loadVideo(yt);
    } else {
      console.warn('[Player] YT not ready, retrying in 1s');
      retryTimeoutRef.current = setTimeout(() => {
        retryTimeoutRef.current = null;
        const ytRetry = getYTPlayer();
        if (ytRetry) loadVideo(ytRetry);
        else console.error('[Player] YT still not ready after retry');
      }, 1000);
    }
  }, [startPolling, updateState]);

  const togglePlay = useCallback(() => {
    const yt = getYTPlayer();
    if (!yt || !currentSong) return;
    try {
      const state = yt.getPlayerState();
      if (state === YTState.PLAYING) {
        yt.pauseVideo();
        updateState({ isPlaying: false });
        updateMediaSessionPlayback(false);
      } else {
        yt.playVideo();
        updateState({ isPlaying: true });
        updateMediaSessionPlayback(true);
      }
    } catch (e) {
      console.error('[Player] togglePlay error:', e);
    }
  }, [currentSong, updateState]);

  // ─── Navigation ────────────────────────────────────────────────
  const next = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) {
      console.warn('[Player] next() called but queue is empty');
      return;
    }

    const st = stateRef.current;
    let nextIdx: number;

    if (st.isShuffle) {
      if (q.length <= 1) {
        nextIdx = 0;
      } else {
        do { nextIdx = Math.floor(Math.random() * q.length); }
        while (nextIdx === currentIndexRef.current);
      }
    } else if (st.repeatMode === 'one') {
      nextIdx = currentIndexRef.current;
    } else {
      nextIdx = currentIndexRef.current + 1;
      if (nextIdx >= q.length) {
        if (st.repeatMode === 'all') {
          nextIdx = 0;
        } else {
          console.log('[Player] Queue ended, stopping.');
          updateState({ isPlaying: false });
          return;
        }
      }
    }

    console.log(`[Player] next(): index ${currentIndexRef.current} → ${nextIdx}, queue length: ${q.length}`);
    currentIndexRef.current = nextIdx;
    const song = q[nextIdx];
    if (song) playSong(song, q);
    else console.error('[Player] next(): no song at index', nextIdx);
  }, [playSong, updateState]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const st = stateRef.current;

    // If song played > 3 seconds, restart it
    const yt = getYTPlayer();
    if (yt) {
      try {
        const ct = yt.getCurrentTime() || 0;
        if (ct > 3) {
          yt.seekTo(0, true);
          updateState({ currentTime: 0 });
          return;
        }
      } catch {}
    }

    let prevIdx = currentIndexRef.current - 1;
    if (prevIdx < 0) {
      prevIdx = st.repeatMode === 'all' ? q.length - 1 : 0;
    }
    currentIndexRef.current = prevIdx;
    const song = q[prevIdx];
    if (song) playSong(song, q);
  }, [playSong, updateState]);

  // ─── Seek ──────────────────────────────────────────────────────
  const seek = useCallback((seconds: number) => {
    const yt = getYTPlayer();
    if (!yt) return;
    try {
      yt.seekTo(seconds, true);
      updateState({ currentTime: seconds });
      updateMediaSessionPosition(seconds, stateRef.current.duration);
    } catch {}
  }, [updateState]);

  const seekForward = useCallback(() => {
    const yt = getYTPlayer();
    if (!yt) return;
    try { seek(Math.min(yt.getDuration() || 0, yt.getCurrentTime() + 10)); } catch {}
  }, [seek]);

  const seekBackward = useCallback(() => {
    const yt = getYTPlayer();
    if (!yt) return;
    try { seek(Math.max(0, yt.getCurrentTime() - 10)); } catch {}
  }, [seek]);

  // ─── Volume & Modes ────────────────────────────────────────────
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(vol)));
    const yt = getYTPlayer();
    if (yt) {
      try {
        yt.setVolume(clamped);
        if (clamped > 0 && yt.isMuted()) yt.unMute();
      } catch {}
    }
    updateState({ volume: clamped, isMuted: clamped === 0 });
  }, [updateState]);

  const toggleMute = useCallback(() => {
    const yt = getYTPlayer();
    if (!yt) return;
    try {
      if (yt.isMuted()) {
        yt.unMute();
        updateState({ isMuted: false });
      } else {
        yt.mute();
        updateState({ isMuted: true });
      }
    } catch {}
  }, [updateState]);

  const toggleShuffle = useCallback(() => {
    updateState({ isShuffle: !stateRef.current.isShuffle });
  }, [updateState]);

  const setRepeatMode = useCallback((mode: 'none' | 'one' | 'all') => {
    updateState({ repeatMode: mode });
  }, [updateState]);

  // ─── Keep refs updated ─────────────────────────────────────────
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { prevRef.current = previous; }, [previous]);
  useEffect(() => { seekRef.current = seek; }, [seek]);

  // ─── Cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPolling();
      stopBackgroundKeepAlive();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, [stopPolling]);

  return {
    currentSong,
    isPlaying: playerState.isPlaying,
    playerState,
    playSong,
    togglePlay,
    next,
    previous,
    seek,
    seekForward,
    seekBackward,
    setVolume,
    toggleMute,
    toggleShuffle,
    setRepeatMode,
  };
}
