export interface TvEpisode {
  episodeNumber: number;
  title: string;
  duration?: string;
  airDate?: string;
  thumbnail?: string;
  overview?: string;
}

export interface TvSeason {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  episodes: TvEpisode[];
}

export interface MovieItem {
  id: string; // TMDB ID (e.g. "969681" or "51025")
  title: string;
  year: string;
  poster: string;
  type: 'FILM' | 'MOVIE' | 'TV' | 'SERIES';
  rating: string;
  genres: string[];
  detailUrl?: string;
  overview?: string;
  totalSeasons?: number;
  totalEpisodes?: number;
  seasons?: TvSeason[];
}

export interface StreamServer {
  id: string;
  name: string;
  badge: string;
  color: string;
  buildMovieUrl: (tmdbId: string) => string;
  buildTvUrl?: (tmdbId: string, season: number, episode: number) => string;
}

export const STREAM_SERVERS: StreamServer[] = [
  {
    id: 'vidsu',
    name: 'Vidsu (Cloudflare AdFree)',
    badge: '100% Ad-Free',
    color: '#a855f7',
    buildMovieUrl: (id) => `https://player-4aq.pages.dev/embed/movie/${id}?autoPlay=true`,
    buildTvUrl: (id, s = 1, e = 1) => `https://player-4aq.pages.dev/embed/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'vidlink',
    name: 'VidLink (Clean HD)',
    badge: 'No Popups',
    color: '#10b981',
    buildMovieUrl: (id) => `https://vidlink.pro/movie/${id}?autoplay=true`,
    buildTvUrl: (id, s = 1, e = 1) => `https://vidlink.pro/tv/${id}/${s}/${e}?autoplay=true`,
  },
  {
    id: 'vidme',
    name: 'Vidme (Vidzen AdFree)',
    badge: 'Fast Stream',
    color: '#ec4899',
    buildMovieUrl: (id) => `https://vidzen.fun/movie/${id}?autoPlay=true`,
    buildTvUrl: (id, s = 1, e = 1) => `https://vidzen.fun/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'vidcore',
    name: 'Vidcore (Nightflix Server)',
    badge: 'Fast HD',
    color: '#00f5ff',
    buildMovieUrl: (id) => `https://vidcore.net/movie/${id}?autoPlay=true`,
    buildTvUrl: (id, s = 1, e = 1) => `https://vidcore.net/tv/${id}/${s}/${e}?autoPlay=true`,
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed CC',
    badge: 'Ad-Light',
    color: '#8b5cf6',
    buildMovieUrl: (id) => `https://player.autoembed.cc/embed/movie/${id}`,
    buildTvUrl: (id, s = 1, e = 1) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc (Global)',
    badge: 'Multi-Language',
    color: '#f59e0b',
    buildMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    buildTvUrl: (id, s = 1, e = 1) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed (Backup)',
    badge: 'High Uptime',
    color: '#3b82f6',
    buildMovieUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    buildTvUrl: (id, s = 1, e = 1) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
];

export function generateDefaultEpisodes(
  seasonNumber: number,
  count: number = 10,
  showTitle: string = '',
  defaultThumb?: string
): TvEpisode[] {
  const list: TvEpisode[] = [];
  for (let i = 1; i <= count; i++) {
    list.push({
      episodeNumber: i,
      title: `Episode ${i}`,
      duration: '45m',
      airDate: `Season ${seasonNumber}`,
      thumbnail: defaultThumb || 'https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg',
      overview: `${showTitle || 'Series'} Season ${seasonNumber}, Episode ${i}. Stream directly in HD without leaving the site.`,
    });
  }
  return list;
}

export const DEFAULT_MOVIES: MovieItem[] = [
  // TV Shows
  {
    id: '51025',
    title: 'Paradise Hotel',
    year: '2005',
    poster: 'https://image.tmdb.org/t/p/w500/ycSBcACecVR0zSnP2ZF83k5f7he.jpg',
    type: 'TV',
    rating: '5.6',
    genres: ['Reality', 'Romance'],
    detailUrl: 'https://nightflix.vg/tv/51025',
    totalSeasons: 1,
    totalEpisodes: 48,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 48,
        episodes: [
  {
    "episodeNumber": 1,
    "title": "Episode 1",
    "duration": "32m",
    "airDate": "2005-09-14",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 2,
    "title": "Episode 2",
    "duration": "32m",
    "airDate": "2005-09-15",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 3,
    "title": "Episode 3",
    "duration": "32m",
    "airDate": "2005-09-16",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 4,
    "title": "Episode 4",
    "duration": "32m",
    "airDate": "2005-09-17",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 5,
    "title": "Episode 5",
    "duration": "32m",
    "airDate": "2005-09-21",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 6,
    "title": "Episode 6",
    "duration": "32m",
    "airDate": "2005-09-22",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 7,
    "title": "Episode 7",
    "duration": "32m",
    "airDate": "2005-09-23",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 8,
    "title": "Episode 8",
    "duration": "32m",
    "airDate": "2005-09-24",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 9,
    "title": "Episode 9",
    "duration": "32m",
    "airDate": "2005-09-28",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 10,
    "title": "Episode 10",
    "duration": "32m",
    "airDate": "2005-09-29",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 11,
    "title": "Episode 11",
    "duration": "32m",
    "airDate": "2005-09-30",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 12,
    "title": "Episode 12",
    "duration": "32m",
    "airDate": "2005-10-01",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 13,
    "title": "Episode 13",
    "duration": "32m",
    "airDate": "2005-10-05",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 14,
    "title": "Episode 14",
    "duration": "32m",
    "airDate": "2005-10-06",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 15,
    "title": "Episode 15",
    "duration": "32m",
    "airDate": "2005-10-07",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 16,
    "title": "Episode 16",
    "duration": "32m",
    "airDate": "2005-10-08",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 17,
    "title": "Episode 17",
    "duration": "32m",
    "airDate": "2005-10-12",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 18,
    "title": "Episode 18",
    "duration": "32m",
    "airDate": "2005-10-13",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 19,
    "title": "Episode 19",
    "duration": "32m",
    "airDate": "2005-10-14",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 20,
    "title": "Episode 20",
    "duration": "32m",
    "airDate": "2005-10-15",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 21,
    "title": "Episode 21",
    "duration": "32m",
    "airDate": "2005-10-19",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 22,
    "title": "Episode 22",
    "duration": "32m",
    "airDate": "2005-10-20",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 23,
    "title": "Episode 23",
    "duration": "32m",
    "airDate": "2005-10-21",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 24,
    "title": "Episode 24",
    "duration": "32m",
    "airDate": "2005-10-22",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 25,
    "title": "Episode 25",
    "duration": "32m",
    "airDate": "2005-10-26",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 26,
    "title": "Episode 26",
    "duration": "32m",
    "airDate": "2005-10-27",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 27,
    "title": "Episode 27",
    "duration": "32m",
    "airDate": "2005-10-28",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 28,
    "title": "Episode 28",
    "duration": "32m",
    "airDate": "2005-10-29",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 29,
    "title": "Episode 29",
    "duration": "32m",
    "airDate": "2005-11-02",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 30,
    "title": "Episode 30",
    "duration": "32m",
    "airDate": "2005-11-03",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 31,
    "title": "Episode 31",
    "duration": "32m",
    "airDate": "2005-11-04",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 32,
    "title": "Episode 32",
    "duration": "32m",
    "airDate": "2005-11-05",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 33,
    "title": "Episode 33",
    "duration": "32m",
    "airDate": "2005-11-09",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 34,
    "title": "Episode 34",
    "duration": "32m",
    "airDate": "2005-11-10",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 35,
    "title": "Episode 35",
    "duration": "32m",
    "airDate": "2005-11-11",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 36,
    "title": "Episode 36",
    "duration": "32m",
    "airDate": "2005-11-12",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 37,
    "title": "Episode 37",
    "duration": "32m",
    "airDate": "2005-11-16",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 38,
    "title": "Episode 38",
    "duration": "32m",
    "airDate": "2005-11-17",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 39,
    "title": "Episode 39",
    "duration": "32m",
    "airDate": "2005-11-18",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 40,
    "title": "Episode 40",
    "duration": "32m",
    "airDate": "2005-11-19",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 41,
    "title": "Episode 41",
    "duration": "32m",
    "airDate": "2005-11-23",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 42,
    "title": "Episode 42",
    "duration": "32m",
    "airDate": "2005-11-24",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 43,
    "title": "Episode 43",
    "duration": "32m",
    "airDate": "2005-11-25",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 44,
    "title": "Episode 44",
    "duration": "32m",
    "airDate": "2005-11-26",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 45,
    "title": "Episode 45",
    "duration": "32m",
    "airDate": "2005-11-30",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 46,
    "title": "Episode 46",
    "duration": "32m",
    "airDate": "2005-12-01",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 47,
    "title": "Episode 47",
    "duration": "32m",
    "airDate": "2005-12-02",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  },
  {
    "episodeNumber": 48,
    "title": "Episode 48",
    "duration": "32m",
    "airDate": "2005-12-03",
    "thumbnail": "https://image.tmdb.org/t/p/original/nun8Ssmni886Ib4v7chgQbswDfl.jpg",
    "overview": "No synopsis available for this episode."
  }
]
      }
    ]
  },
  {
    id: '108978',
    title: 'Reacher',
    year: '2022',
    poster: 'https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg',
    type: 'TV',
    rating: '8.1',
    genres: ['Action & Adventure', 'Crime'],
    detailUrl: 'https://nightflix.vg/tv/108978',
    totalSeasons: 3,
    totalEpisodes: 24,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 8,
        episodes: generateDefaultEpisodes(1, 8, 'Reacher', 'https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg')
      },
      {
        seasonNumber: 2,
        name: 'Season 2',
        episodeCount: 8,
        episodes: generateDefaultEpisodes(2, 8, 'Reacher', 'https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg')
      },
      {
        seasonNumber: 3,
        name: 'Season 3',
        episodeCount: 8,
        episodes: generateDefaultEpisodes(3, 8, 'Reacher', 'https://image.tmdb.org/t/p/w500/f1VCQIG2iCyOookdgOzwtUpwWC0.jpg')
      }
    ]
  },
  {
    id: '36109',
    title: 'Paradise Hotel (2009)',
    year: '2009',
    poster: 'https://image.tmdb.org/t/p/w500/k6KhQBpW4gdcoSp9JQvQFq14lFI.jpg',
    type: 'TV',
    rating: '5.7',
    genres: ['Reality'],
    detailUrl: 'https://nightflix.vg/tv/36109',
    totalSeasons: 1,
    totalEpisodes: 10,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 10,
        episodes: generateDefaultEpisodes(1, 10, 'Paradise Hotel (2009)', 'https://image.tmdb.org/t/p/w500/k6KhQBpW4gdcoSp9JQvQFq14lFI.jpg')
      }
    ]
  },
  {
    id: '30801',
    title: '2 Days and 1 Night',
    year: '2007',
    poster: 'https://image.tmdb.org/t/p/w500/qezeCEkIKHQM5iwyVeYBuXmYA2h.jpg',
    type: 'TV',
    rating: '6.7',
    genres: ['Comedy', 'Reality'],
    detailUrl: 'https://nightflix.vg/tv/30801',
    totalSeasons: 4,
    totalEpisodes: 50,
    seasons: [
      {
        seasonNumber: 1,
        name: 'Season 1',
        episodeCount: 20,
        episodes: generateDefaultEpisodes(1, 20, '2 Days and 1 Night', 'https://image.tmdb.org/t/p/w500/qezeCEkIKHQM5iwyVeYBuXmYA2h.jpg')
      }
    ]
  },
  // Movies
  {
    id: '969681',
    title: 'Spider-Man: Brand New Day',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg',
    type: 'FILM',
    rating: '7.8',
    genres: ['Sci-Fi', 'Action'],
    detailUrl: 'https://nightflix.vg/movie/969681',
  },
  {
    id: '1204680',
    title: 'Coyote vs. Acme',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/vhv7lBWYM0DUuNU2a0V7Rhq21dD.jpg',
    type: 'FILM',
    rating: '7.6',
    genres: ['Comedy', 'Adventure'],
    detailUrl: 'https://nightflix.vg/movie/1204680',
  },
  {
    id: '1368337',
    title: 'The Odyssey',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg',
    type: 'FILM',
    rating: '8.0',
    genres: ['Adventure', 'Action'],
    detailUrl: 'https://nightflix.vg/movie/1368337',
  },
  {
    id: '1288445',
    title: 'Mutiny',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/pu2VxGlpGwffOx292w18b1tv96j.jpg',
    type: 'FILM',
    rating: '6.4',
    genres: ['Action', 'Thriller'],
    detailUrl: 'https://nightflix.vg/movie/1288445',
  },
  {
    id: '1375646',
    title: 'Colony',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/tN799oUR0f1gUKDYdMNrDaY7I51.jpg',
    type: 'FILM',
    rating: '8.1',
    genres: ['Action', 'Horror'],
    detailUrl: 'https://nightflix.vg/movie/1375646',
  },
  {
    id: '1108427',
    title: 'Moana',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/gaet1xQ2nxrG0V1Ep9T20ZMNEIC.jpg',
    type: 'FILM',
    rating: '7.0',
    genres: ['Family', 'Fantasy'],
    detailUrl: 'https://nightflix.vg/movie/1108427',
  },
  {
    id: '1294189',
    title: 'The Mongoose',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/eSS5mvSG84UUuvtbHel5Yu3Wik4.jpg',
    type: 'FILM',
    rating: '0.0',
    genres: ['Action', 'Thriller'],
    detailUrl: 'https://nightflix.vg/movie/1294189',
  },
  {
    id: '1137844',
    title: 'Mayday',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/hVXjX1jLZ1ljFSNGXpjJfbTUOa7.jpg',
    type: 'FILM',
    rating: '7.9',
    genres: ['Action', 'Comedy'],
    detailUrl: 'https://nightflix.vg/movie/1137844',
  },
  {
    id: '1440098',
    title: 'Drawn Together',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/6rpvddXbaQPOi0fB2HKWbZ3uUSg.jpg',
    type: 'FILM',
    rating: '6.6',
    genres: ['Romance', 'Thriller'],
    detailUrl: 'https://nightflix.vg/movie/1440098',
  },
  {
    id: '1386315',
    title: 'The Runner',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/uxCaBoYXsDC4A0SqTm3SISj0OwK.jpg',
    type: 'FILM',
    rating: '6.7',
    genres: ['Thriller', 'Action'],
    detailUrl: 'https://nightflix.vg/movie/1386315',
  },
  {
    id: '1506560',
    title: 'Clash of the Thundermans',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/16oqRrWVzQm6qdGfBxvziZ2UiMT.jpg',
    type: 'FILM',
    rating: '6.7',
    genres: ['TV Movie', 'Family'],
    detailUrl: 'https://nightflix.vg/movie/1506560',
  },
  {
    id: '1393326',
    title: 'Ghost in the Cell',
    year: '2026',
    poster: 'https://image.tmdb.org/t/p/w500/zxcMdx0w5Zmg8yZuuiS7CJ8vOea.jpg',
    type: 'FILM',
    rating: '7.2',
    genres: ['Horror', 'Comedy'],
    detailUrl: 'https://nightflix.vg/movie/1393326',
  },
];
