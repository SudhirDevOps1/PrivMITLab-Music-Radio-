import { useState, useRef, useCallback, useEffect } from 'react';
import type { Song, PlayerState } from '@/types';
import { getYTPlayer, PlayerState as YTState } from '@/utils/youtubePlayer';

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

  // Refs for media session handlers to avoid re-registering
  const nextRef = useRef<() => void>(() => {});
  const prevRef = useRef<() => void>(() => {});
  const seekRef = useRef<(seconds: number) => void>(() => {});

  // Sync refs
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // Smart state updater - updates state + ref together (prevents stale closures)
  const updateState = useCallback((patch: Partial<PlayerState>) => {
    setPlayerState((prev) => {
      const next = { ...prev, ...patch };
      stateRef.current = next;
      return next;
    });
  }, []);

  // ─── Polling ────────────────────────────────────────────────────────────────
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
        const state = yt.getPlayerState();
        const ct = Math.floor(yt.getCurrentTime() || 0);
        const dur = Math.floor(yt.getDuration() || 0);
        const playing = state === YTState.PLAYING || state === YTState.BUFFERING;

        // Only update if something changed (prevents unnecessary re-renders)
        const prev = stateRef.current;
        if (prev.isPlaying !== playing || prev.currentTime !== ct || prev.duration !== dur) {
          updateState({ isPlaying: playing, currentTime: ct, duration: dur });
        }
      } catch {
        // YT not ready yet
      }
    }, 500);
  }, [stopPolling, updateState]);

  // ─── Media Session ──────────────────────────────────────────────────────────
  const updateMediaSession = useCallback((song: Song) => {
    if (!('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: 'PrivMITLab Music',
        artwork: [{ src: song.thumbnail, sizes: '480x360', type: 'image/jpeg' }],
      });
    } catch {}
  }, []);

  // Register media session handlers ONCE
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => {
      const yt = getYTPlayer();
      if (yt) { try { yt.playVideo(); updateState({ isPlaying: true }); } catch {} }
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      const yt = getYTPlayer();
      if (yt) { try { yt.pauseVideo(); updateState({ isPlaying: false }); } catch {} }
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevRef.current());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seekRef.current(details.seekTime);
    });

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
  }, [updateState]);

  // ─── Core Controls ──────────────────────────────────────────────────────────
  const playSong = useCallback((song: Song, q?: Song[]) => {
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    const currentQueue = q || queueRef.current;
    const idx = currentQueue.findIndex((s) => s.videoId === song.videoId);
    currentIndexRef.current = idx >= 0 ? idx : 0;

    setCurrentSong(song);
    updateMediaSession(song);

    const loadVideo = (yt: ReturnType<typeof getYTPlayer>) => {
      try {
        yt.loadVideoById(song.videoId);
        // Apply current volume to new track
        try { yt.setVolume(stateRef.current.volume); } catch {}
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
      }, 1000);
    }
  }, [updateMediaSession, startPolling, updateState]);

  const togglePlay = useCallback(() => {
    const yt = getYTPlayer();
    if (!yt || !currentSong) return;
    try {
      const state = yt.getPlayerState();
      if (state === YTState.PLAYING) {
        yt.pauseVideo();
        updateState({ isPlaying: false });
      } else {
        yt.playVideo();
        updateState({ isPlaying: true });
      }
    } catch (e) {
      console.error('[Player] togglePlay error:', e);
    }
  }, [currentSong, updateState]);

  // ─── Navigation ─────────────────────────────────────────────────────────────
  const next = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const st = stateRef.current;

    let nextIdx: number;
    if (st.isShuffle) {
      if (q.length <= 1) {
        nextIdx = 0;
      } else {
        // Pick random, but NOT the current song
        do {
          nextIdx = Math.floor(Math.random() * q.length);
        } while (nextIdx === currentIndexRef.current);
      }
    } else if (st.repeatMode === 'one') {
      nextIdx = currentIndexRef.current;
    } else {
      nextIdx = currentIndexRef.current + 1;
      if (nextIdx >= q.length) {
        if (st.repeatMode === 'all') nextIdx = 0;
        else return; // stop at end
      }
    }

    currentIndexRef.current = nextIdx;
    const song = q[nextIdx];
    if (song) playSong(song, q);
  }, [playSong]);

  const previous = useCallback(() => {
    const q = queueRef.current;
    if (!q.length) return;
    const st = stateRef.current;

    // If song has played > 3 seconds, restart it instead of going back
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

  // ─── Seek ───────────────────────────────────────────────────────────────────
  const seek = useCallback((seconds: number) => {
    const yt = getYTPlayer();
    if (!yt) return;
    try {
      yt.seekTo(seconds, true);
      updateState({ currentTime: seconds });
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

  // ─── Volume & Modes ─────────────────────────────────────────────────────────
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

  // ─── Keep refs updated for Media Session ────────────────────────────────────
  useEffect(() => { nextRef.current = next; }, [next]);
  useEffect(() => { prevRef.current = previous; }, [previous]);
  useEffect(() => { seekRef.current = seek; }, [seek]);

  // ─── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopPolling();
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
