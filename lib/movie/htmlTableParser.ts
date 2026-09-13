import { MovieItem } from './movieTypes';

/**
 * Extracts TMDB Movie ID from any nightflix URL, watch URL, or raw ID.
 * Example inputs:
 * - "https://nightflix.vg/movie/969681" -> "969681"
 * - "https://nightflix.vg/watch/movie/969681" -> "969681"
 * - "https://vidcore.net/movie/969681" -> "969681"
 * - "969681" -> "969681"
 */
export function extractMovieId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Match /movie/{id} or /watch/movie/{id}
  const match = trimmed.match(/(?:movie|tv)\/(\d+)/i);
  if (match && match[1]) {
    return match[1];
  }

  // If pure digits
  if (/^\d{3,10}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Parses raw HTML table (like <table><tbody><tr>...</tr></tbody></table>)
 * into a structured array of MovieItem objects.
 */
export function parseHtmlMovieTable(htmlString: string): MovieItem[] {
  if (!htmlString || typeof htmlString !== 'string') return [];

  const movies: MovieItem[] = [];

  // Match table rows <tr>...</tr>
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;

  while ((rowMatch = rowRegex.exec(htmlString)) !== null) {
    const rowHtml = rowMatch[1];

    // Skip header rows <th>
    if (/<th/i.test(rowHtml)) {
      continue;
    }

    // Extract all cells <td>...</td>
    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].trim());
    }

    if (cells.length === 0) continue;

    // 1. Poster: search for <img src="..."> in first cell or any cell
    let poster = '';
    const imgMatch = rowHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      poster = imgMatch[1];
    }

    // 2. Detail Link / ID: search for href="..."
    let detailUrl = '';
    let extractedId: string | null = null;
    const linkMatch = rowHtml.match(/href=["']([^"']+)["']/i);
    if (linkMatch) {
      detailUrl = linkMatch[1];
      extractedId = extractMovieId(detailUrl);
    }

    // 3. Title: look for <strong>Title</strong> or 2nd cell
    let title = '';
    const strongMatch = rowHtml.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
    if (strongMatch) {
      title = stripHtml(strongMatch[1]);
    } else if (cells[1]) {
      title = stripHtml(cells[1]);
    }

    // 4. Year
    let year = '';
    const yearMatch = rowHtml.match(/\b(19\d\d|20\d\d)\b/);
    if (yearMatch) {
      year = yearMatch[1];
    } else if (cells[2]) {
      year = stripHtml(cells[2]);
    }

    // 5. Type: look for class="badge" or FILM/TV
    let type: 'FILM' | 'TV' | 'SERIES' = 'FILM';
    if (/TV|SERIES/i.test(rowHtml)) {
      type = 'TV';
    }

    // 6. Rating: look for ⭐ 7.8 or digits
    let rating = '7.5';
    const ratingMatch = rowHtml.match(/⭐?\s*(\d+(?:\.\d+)?)/);
    if (ratingMatch) {
      rating = ratingMatch[1];
    }

    // 7. Genres: e.g. "Sci-Fi, Action"
    let genres: string[] = [];
    if (cells[5]) {
      const gStr = stripHtml(cells[5]);
      genres = gStr.split(',').map((g) => g.trim()).filter(Boolean);
    } else {
      // Fallback genres if matched in text
      const knownGenres = ['Action', 'Comedy', 'Sci-Fi', 'Thriller', 'Horror', 'Adventure', 'Drama', 'Family', 'Romance', 'Fantasy'];
      genres = knownGenres.filter((g) => new RegExp(g, 'i').test(rowHtml));
    }

    // If ID couldn't be found from href, try to extract any digits in row
    if (!extractedId) {
      const anyIdMatch = rowHtml.match(/(\d{5,8})/);
      if (anyIdMatch) {
        extractedId = anyIdMatch[1];
      }
    }

    if (extractedId && title) {
      movies.push({
        id: extractedId,
        title,
        year: year || '2026',
        poster: poster || 'https://via.placeholder.com/300x450/0d1117/1a2332?text=No+Poster',
        type,
        rating,
        genres: genres.length > 0 ? genres : ['Cinema'],
        detailUrl: detailUrl || `https://nightflix.vg/movie/${extractedId}`,
      });
    }
  }

  return movies;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}
