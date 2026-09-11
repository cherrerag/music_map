import { useState, useEffect } from 'react';

const CAVA_API = 'https://cava-ui.vercel.app/api/albums';

let cachedAlbums = null;
let fetchPromise = null;

function cleanString(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function fetchCavaAlbums() {
  if (cachedAlbums !== null) return Promise.resolve(cachedAlbums);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(CAVA_API)
    .then(res => (res.ok ? res.json() : null))
    .then(data => {
      // Cava API returns { total: 5088, albums: [...] }
      const list = Array.isArray(data) ? data : (data?.albums || []);
      cachedAlbums = list;
      fetchPromise = null;
      return cachedAlbums;
    })
    .catch(err => {
      console.warn('[CavaService] Error fetching catalog:', err);
      cachedAlbums = [];
      fetchPromise = null;
      return [];
    });

  return fetchPromise;
}

export function useCavaCatalog(artistName) {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (!artistName) {
      setAlbums([]);
      return;
    }
    const target = cleanString(artistName);

    fetchCavaAlbums().then(all => {
      const matches = all.filter(album => {
        const artist = cleanString(album.artist || album.artistName);
        const title = cleanString(album.title);
        const query = cleanString(album.consultaTidal);
        return (
          (artist && (artist.includes(target) || target.includes(artist))) ||
          (title && title.includes(target)) ||
          (query && query.includes(target))
        );
      });
      setAlbums(matches);
    });
  }, [artistName]);

  return albums;
}
