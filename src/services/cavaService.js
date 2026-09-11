import { useState, useEffect } from 'react';

const CAVA_API = 'https://cava-ui.vercel.app/api/albums';

let cachedAlbums = null;
let fetchPromise = null;

function fetchCavaAlbums() {
  if (cachedAlbums !== null) return Promise.resolve(cachedAlbums);
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch(CAVA_API)
    .then(res => (res.ok ? res.json() : []))
    .then(data => {
      cachedAlbums = Array.isArray(data) ? data : [];
      fetchPromise = null;
      return cachedAlbums;
    })
    .catch(() => {
      cachedAlbums = [];
      fetchPromise = null;
      return [];
    });

  return fetchPromise;
}

export function useCavaCatalog(artistName) {
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    if (!artistName) return;
    const name = artistName.toLowerCase().trim();

    fetchCavaAlbums().then(all => {
      const matches = all.filter(album => {
        const a = (
          album.artist || album.artistName || album.artist_name || ''
        ).toLowerCase().trim();
        return a === name || a.includes(name) || name.includes(a);
      });
      setAlbums(matches);
    });
  }, [artistName]);

  return albums;
}
