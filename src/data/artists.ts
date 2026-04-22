import type { Artist, Mood } from '@/types';

export const ARTISTS: Artist[] = [
  // ─── Bollywood ──────────────────────────────────────────
  { id: '1',  name: 'Arijit Singh',      genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',  searchQuery: 'Arijit Singh best songs' },
  { id: '2',  name: 'Shreya Ghoshal',    genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb82c65b9e9a7023c32736e1a3',  searchQuery: 'Shreya Ghoshal songs' },
  { id: '3',  name: 'AR Rahman',         genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb5b6bcfe82cdd4e95f3c88b73',  searchQuery: 'AR Rahman songs' },
  { id: '4',  name: 'Atif Aslam',        genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb9a4f81f0df7c7b8acf4da57f',  searchQuery: 'Atif Aslam songs' },
  { id: '5',  name: 'Sonu Nigam',        genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb7b4def02024f5285c1b9b7ab',  searchQuery: 'Sonu Nigam songs' },
  { id: '6',  name: 'Neha Kakkar',       genre: 'Bollywood',  image: 'https://i.scdn.co/image/ab6761610000e5eb7f50e96c4b3cd5b1de1c5e0e',  searchQuery: 'Neha Kakkar songs' },
  { id: '7',  name: 'Lata Mangeshkar',   genre: 'Classical',  image: 'https://i.scdn.co/image/ab6761610000e5eb9fe2780a4b42e8af47aab2f2',  searchQuery: 'Lata Mangeshkar songs' },
  { id: '8',  name: 'Kishore Kumar',     genre: 'Classic',    image: 'https://i.scdn.co/image/ab6761610000e5ebdbf3f5faa44f8f0f2e1f1e21',  searchQuery: 'Kishore Kumar songs' },
  { id: '9',  name: 'Mohammed Rafi',     genre: 'Classic',    image: 'https://i.scdn.co/image/ab6761610000e5ebdca3a3c54b04b6c13a9e4bfe',  searchQuery: 'Mohammed Rafi songs' },
  { id: '10', name: 'Asha Bhosle',       genre: 'Classic',    image: 'https://i.scdn.co/image/ab6761610000e5eb9b1d0c0e81d2be0f4d3e9b4a',  searchQuery: 'Asha Bhosle songs' },

  // ─── Punjabi ────────────────────────────────────────────
  { id: '11', name: 'AP Dhillon',         genre: 'Punjabi',    image: 'https://i.scdn.co/image/ab6761610000e5eba08b0b9e44a2e4b2c66de7b8',  searchQuery: 'AP Dhillon songs' },
  { id: '12', name: 'Diljit Dosanjh',     genre: 'Punjabi',    image: 'https://i.scdn.co/image/ab6761610000e5eb0e5abf8a2ab44f7834734ba1',  searchQuery: 'Diljit Dosanjh songs' },
  { id: '13', name: 'Guru Randhawa',      genre: 'Punjabi',    image: 'https://i.ytimg.com/vi/pMxRQQJREsQ/mqdefault.jpg', searchQuery: 'Guru Randhawa songs' },
  { id: '14', name: 'Mika Singh',         genre: 'Punjabi',    image: 'https://i.ytimg.com/vi/0sparBFGCSQ/mqdefault.jpg', searchQuery: 'Mika Singh songs' },
  { id: '15', name: 'Badshah',            genre: 'Hip-Hop',    image: 'https://i.ytimg.com/vi/hLNhAjxQRFU/mqdefault.jpg', searchQuery: 'Badshah songs' },

  // ─── Bhojpuri ───────────────────────────────────────────
  { id: '16', name: 'Pawan Singh',        genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/JiHzrOuQa7A/mqdefault.jpg', searchQuery: 'Pawan Singh Bhojpuri songs' },
  { id: '17', name: 'Khesari Lal',        genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/UfMIl6VLbSM/mqdefault.jpg', searchQuery: 'Khesari Lal Yadav songs' },
  { id: '18', name: 'Ritesh Pandey',      genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/D2xCTH3CbJs/mqdefault.jpg', searchQuery: 'Ritesh Pandey Bhojpuri songs' },
  { id: '19', name: 'Dinesh Lal Nirahua', genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/eV0mjB3lxJQ/mqdefault.jpg', searchQuery: 'Nirahua Bhojpuri songs' },
  { id: '20', name: 'Pramod Premi',       genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/CkRHBGZW5eE/mqdefault.jpg', searchQuery: 'Pramod Premi Bhojpuri songs' },

  // ─── Indie / Hip-Hop ───────────────────────────────────
  { id: '21', name: 'Divine',             genre: 'Hip-Hop',    image: 'https://i.ytimg.com/vi/8YtFGlJ6ugs/mqdefault.jpg', searchQuery: 'Divine rapper songs' },
  { id: '22', name: 'Raftaar',            genre: 'Hip-Hop',    image: 'https://i.ytimg.com/vi/g1Rb1gLb0KM/mqdefault.jpg', searchQuery: 'Raftaar songs' },
  { id: '23', name: 'King',               genre: 'Indie',      image: 'https://i.ytimg.com/vi/M_0jW1n6OHY/mqdefault.jpg', searchQuery: 'King singer Tu Aashiqui songs' },

  // ─── More Bollywood ─────────────────────────────────────
  { id: '24', name: 'Jubin Nautiyal',     genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/Bc7WCsrZySA/mqdefault.jpg', searchQuery: 'Jubin Nautiyal songs' },
  { id: '25', name: 'Darshan Raval',      genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/xbGX1R8m1Xk/mqdefault.jpg', searchQuery: 'Darshan Raval songs' },
  { id: '26', name: 'Tony Kakkar',        genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/vPCprA2eWCU/mqdefault.jpg', searchQuery: 'Tony Kakkar songs' },
  { id: '27', name: 'Alka Yagnik',        genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/cIf4pn19yY0/mqdefault.jpg', searchQuery: 'Alka Yagnik songs' },
  { id: '28', name: 'Udit Narayan',       genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/0yWYQW4rM3E/mqdefault.jpg', searchQuery: 'Udit Narayan songs' },
  { id: '29', name: 'Kumar Sanu',         genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/WHpFmmqJPbc/mqdefault.jpg', searchQuery: 'Kumar Sanu songs' },
  { id: '30', name: 'Sunidhi Chauhan',    genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/5-nl4tnB3w0/mqdefault.jpg', searchQuery: 'Sunidhi Chauhan songs' },
  { id: '31', name: 'Shaan',              genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/CWznG6E8Nl0/mqdefault.jpg', searchQuery: 'Shaan singer songs' },
  { id: '32', name: 'KK',                 genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/H4bfVKbJRGk/mqdefault.jpg', searchQuery: 'KK singer songs' },
  { id: '33', name: 'Ankit Tiwari',       genre: 'Bollywood',  image: 'https://i.ytimg.com/vi/BI4zWE6Ybic/mqdefault.jpg', searchQuery: 'Ankit Tiwari songs' },
  { id: '34', name: 'Mithoon',            genre: 'Composer',   image: 'https://i.ytimg.com/vi/gFZFTFCb1Zk/mqdefault.jpg', searchQuery: 'Mithoon songs' },
  { id: '35', name: 'Pritam',             genre: 'Composer',   image: 'https://i.ytimg.com/vi/7Hm1PBBR-gA/mqdefault.jpg', searchQuery: 'Pritam songs' },

  // ─── Bhojpuri Extra ─────────────────────────────────────
  { id: '36', name: 'Ankush Raja',        genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/6UjYPzO3GJM/mqdefault.jpg', searchQuery: 'Ankush Raja Bhojpuri songs' },
  { id: '37', name: 'Neelkamal Singh',     genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/cKxUIfPAQyc/mqdefault.jpg', searchQuery: 'Neelkamal Singh Bhojpuri songs' },
  { id: '38', name: 'Samar Singh',        genre: 'Bhojpuri',   image: 'https://i.ytimg.com/vi/QmYFHN3n4rg/mqdefault.jpg', searchQuery: 'Samar Singh Bhojpuri songs' },
  { id: '39', name: 'Tanishk Bagchi',     genre: 'Composer',   image: 'https://i.ytimg.com/vi/rGzKrKMqJfs/mqdefault.jpg', searchQuery: 'Tanishk Bagchi songs' },
  { id: '40', name: 'Amaal Mallik',       genre: 'Composer',   image: 'https://i.ytimg.com/vi/X7J6U4TLzY0/mqdefault.jpg', searchQuery: 'Amaal Mallik songs' },
];

export const MOODS: Mood[] = [
  { id: '1',  name: '😍 Romantic',   query: 'romantic hindi songs 2024',     icon: '😍', gradient: 'from-pink-500 to-rose-500' },
  { id: '2',  name: '💪 Workout',    query: 'gym workout motivation songs',  icon: '💪', gradient: 'from-orange-500 to-red-500' },
  { id: '3',  name: '😌 Chill',      query: 'chill lofi hindi songs',        icon: '😌', gradient: 'from-blue-500 to-cyan-500' },
  { id: '4',  name: '🎉 Party',      query: 'party songs Hindi 2024',        icon: '🎉', gradient: 'from-violet-500 to-purple-500' },
  { id: '5',  name: '😢 Sad',        query: 'sad songs Hindi broken heart',  icon: '😢', gradient: 'from-slate-500 to-gray-500' },
  { id: '6',  name: '🕉️ Devotional', query: 'bhakti songs devotional Hindi', icon: '🕉️', gradient: 'from-yellow-500 to-amber-500' },
  { id: '7',  name: '🎸 Retro',      query: 'old classic Hindi songs 90s',   icon: '🎸', gradient: 'from-amber-500 to-orange-500' },
  { id: '8',  name: '🔥 Trending',   query: 'trending Hindi songs 2024',     icon: '🔥', gradient: 'from-red-500 to-pink-500' },
  { id: '9',  name: '🎤 Bhojpuri',   query: 'Bhojpuri superhit songs 2024',  icon: '🎤', gradient: 'from-green-500 to-emerald-500' },
  { id: '10', name: '🎵 Punjabi',    query: 'new Punjabi songs 2024',        icon: '🎵', gradient: 'from-indigo-500 to-blue-500' },
  { id: '11', name: '🌙 Night',      query: 'night drive songs Hindi',       icon: '🌙', gradient: 'from-purple-900 to-indigo-900' },
  { id: '12', name: '🎼 Classical',  query: 'Indian classical music songs',  icon: '🎼', gradient: 'from-teal-500 to-green-500' },
];

export const TRENDING_SEARCHES = [
  '🔥 Teri Ada', '💫 Tum Kya Mile', '🎵 Ve Kamleya', '❤️ Kesariya',
  '🎤 Arjan Vailly', '🌟 Oo Antava', '💃 Pushpa songs', '🎸 Jhoome Jo Pathaan',
  '🕺 Naatu Naatu', '🎵 Satranga', '💥 Besharam Rang', '🌙 Raataan Lambiyan',
  '❤️ Tere Naam', '🎵 Bhool Bhulaiyaa 2', '🎤 Bhojpuri Superhit 2024',
  '🌺 Hanuman Chalisa', '🔥 New Punjabi 2024', '💫 Sid Sriram hits',
];
