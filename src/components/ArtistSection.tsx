import { memo, useState, useCallback, useMemo } from 'react';
import { Music } from 'lucide-react';
import type { Artist } from '@/types';
import { ARTISTS } from '@/data/artists';

// ─── Genre Gradients (fallback avatar colors) ──────────────
const GENRE_GRADIENTS: Record<string, string> = {
  Bollywood:   'from-violet-500 to-pink-500',
  Classical:   'from-amber-500 to-orange-500',
  Classic:     'from-amber-600 to-yellow-500',
  Punjabi:     'from-indigo-500 to-blue-500',
  Bhojpuri:    'from-green-500 to-emerald-500',
  'Hip-Hop':   'from-red-500 to-orange-500',
  Indie:       'from-cyan-500 to-teal-500',
  Composer:    'from-purple-500 to-violet-600',
};
const DEFAULT_GRADIENT = 'from-violet-500 to-pink-500';

// ─── Artist Avatar (with bulletproof fallback) ──────────────
const ArtistAvatar = memo(function ArtistAvatar({
  artist,
  size,
}: {
  artist: Artist;
  size: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const handleError = useCallback(() => setImgFailed(true), []);

  const gradient = GENRE_GRADIENTS[artist.genre] || DEFAULT_GRADIENT;
  const initial = artist.name.charAt(0).toUpperCase();

  // Fallback: gradient circle with initial letter
  if (imgFailed) {
    return (
      <div
        className={`w-full h-full rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <span className="text-white font-bold" style={{ fontSize: size * 0.4 }}>
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden" style={{ width: size, height: size }}>
      <img
        src={artist.image}
        alt={artist.name}
        className="w-full h-full object-cover"
        onError={handleError}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
});

// ─── Genre Filter Buttons ───────────────────────────────────
const GENRE_LABELS = ['All', 'Bollywood', 'Punjabi', 'Bhojpuri', 'Classic', 'Hip-Hop', 'Composer'];

// ─── Main Section ───────────────────────────────────────────
interface Props {
  onArtistClick: (query: string) => void;
  darkMode: boolean;
}

export default memo(function ArtistSection({ onArtistClick, darkMode }: Props) {
  const [selectedGenre, setSelectedGenre] = useState('All');

  const filteredArtists = useMemo(() => {
    if (selectedGenre === 'All') return ARTISTS;
    return ARTISTS.filter((a) => a.genre === selectedGenre);
  }, [selectedGenre]);

  return (
    <section>
      <h2 className="text-sm sm:text-base font-bold mb-3 flex items-center gap-2">
        🎤 Popular Artists
        <span className="text-xs font-normal text-gray-400">({filteredArtists.length})</span>
      </h2>

      {/* Genre filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {GENRE_LABELS.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              selectedGenre === genre
                ? 'bg-violet-500/30 border-violet-500/50 text-violet-300'
                : darkMode
                ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Artist grid — responsive columns */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredArtists.map((artist) => (
          <button
            key={artist.id}
            onClick={() => onArtistClick(artist.searchQuery || `${artist.name} songs`)}
            className="flex flex-col items-center gap-1.5 group transition-all hover:scale-105 active:scale-95"
          >
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
              <ArtistAvatar artist={artist} size={112} />
            </div>

            {/* Name */}
            <p className="text-[10px] sm:text-xs font-medium text-center leading-tight truncate w-full max-w-[112px]">
              {artist.name}
            </p>

            {/* Genre tag */}
            <p className="text-[8px] sm:text-[10px] text-gray-400 truncate">
              {artist.genre}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
});
