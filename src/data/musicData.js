// Mock Database for MusicMap MVP
export const SEED_ARTISTS = [
  {
    id: "soda-stereo",
    name: "Soda Stereo",
    country: "Argentina",
    city: "Buenos Aires",
    flag: "🇦🇷",
    genres: ["Rock en Español", "Post-Punk", "Alternative Rock"],
    popularity: 92,
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    bio: "Banda mítica de rock argentina formada en 1982 por Gustavo Cerati, Zeta Bosio y Charly Alberti. Pioneros del rock en español e influencia fundamental en toda Latinoamérica.",
    topTracks: [
      { title: "De Música Ligera", album: "Canción Animal", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/ac/b1/68/acb1681a-3a20-ea0e-b199-dc1f2e680a45/mzaf_3751899153482475975.plus.aac.p.m4a" },
      { title: "Persiana Americana", album: "Signos", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/c3/8b/17/c38b1797-a642-c934-276d-12ed577ef230/mzaf_12565458323717454477.plus.aac.p.m4a" },
      { title: "En la Ciudad de la Furia", album: "Doble Vida", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/64/e2/3a/64e23a6a-ef33-0cf6-37c8-4a3765e532c9/mzaf_6222270713983086923.plus.aac.p.m4a" }
    ],
    similar: [
      { id: "gustavo-cerati", name: "Gustavo Cerati", country: "Argentina", flag: "🇦🇷", similarity: 0.98, isLocal: true, genres: ["Art Rock", "Synth-Pop"] },
      { id: "los-prisioneros", name: "Los Prisioneros", country: "Chile", flag: "🇨🇱", similarity: 0.88, isLocal: true, genres: ["Post-Punk", "Synth-Pop"] },
      { id: "virus", name: "Virus", country: "Argentina", flag: "🇦🇷", similarity: 0.85, isLocal: true, genres: ["New Wave", "Synth-Pop"] },
      { id: "zoe", name: "Zoé", country: "México", flag: "🇲🇽", similarity: 0.82, isLocal: false, genres: ["Indie Rock", "Psychedelic"] },
      { id: "charly-garcia", name: "Charly García", country: "Argentina", flag: "🇦🇷", similarity: 0.89, isLocal: true, genres: ["Prog Rock", "Pop Rock"] },
      { id: "babasonicos", name: "Babasónicos", country: "Argentina", flag: "🇦🇷", similarity: 0.84, isLocal: true, genres: ["Alternative Rock", "Glam Rock"] },
      { id: "cafe-tacvba", name: "Café Tacvba", country: "México", flag: "🇲🇽", similarity: 0.80, isLocal: false, genres: ["Alternative", "Folk Rock"] },
      { id: "los-tres", name: "Los Tres", country: "Chile", flag: "🇨🇱", similarity: 0.83, isLocal: true, genres: ["Alternative Rock", "Jazz Rock"] },
      { id: "the-cure", name: "The Cure", country: "Reino Unido", flag: "🇬🇧", similarity: 0.78, isLocal: false, genres: ["Post-Punk", "Gothic Rock"] }
    ]
  },
  {
    id: "tame-impala",
    name: "Tame Impala",
    country: "Australia",
    city: "Perth",
    flag: "🇦🇺",
    genres: ["Neo-Psychedelia", "Synth-Pop", "Indie Rock"],
    popularity: 95,
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80",
    bio: "Proyecto de música psicodélica creado por Kevin Parker en Perth, Australia. Reconocido por sus densas capas sonoras, sintetizadores análogos y producción hipnótica.",
    topTracks: [
      { title: "The Less I Know The Better", album: "Currents", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8b/55/f3/8b55f3a3-3204-8930-f156-82843546950e/mzaf_9370328603131228430.plus.aac.p.m4a" },
      { title: "Feels Like We Only Go Backwards", album: "Lonerism", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/46/3a/f8/463af8fb-3ad4-1a5a-02c7-edab14457e10/mzaf_2186243149485269803.plus.aac.p.m4a" },
      { title: "Borderline", album: "The Slow Rush", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/04/9b/47/049b4772-0cc3-55d8-0c92-86a7368679a7/mzaf_11944374016959280597.plus.aac.p.m4a" }
    ],
    similar: [
      { id: "pond", name: "Pond", country: "Australia", flag: "🇦🇺", similarity: 0.95, isLocal: false, genres: ["Psychedelic Rock"] },
      { id: "unknown-mortal-orchestra", name: "Unknown Mortal Orchestra", country: "Nueva Zelanda", flag: "🇳🇿", similarity: 0.88, isLocal: false, genres: ["Psychedelic Soul", "Indie"] },
      { id: "mac-demarco", name: "Mac DeMarco", country: "Canadá", flag: "🇨🇦", similarity: 0.82, isLocal: false, genres: ["Indie Pop", "Jangle Pop"] },
      { id: "beach-house", name: "Beach House", country: "Estados Unidos", flag: "🇺🇸", similarity: 0.80, isLocal: false, genres: ["Dream Pop", "Shoegaze"] },
      { id: "boogarins", name: "Boogarins", country: "Brasil", flag: "🇧🇷", similarity: 0.86, isLocal: true, genres: ["Psychedelic Rock", "Tropicália"] },
      { id: "khruangbin", name: "Khruangbin", country: "Estados Unidos", flag: "🇺🇸", similarity: 0.84, isLocal: false, genres: ["Psychedelic Funk", "Dub"] },
      { id: "king-gizzard", name: "King Gizzard & The Lizard Wizard", country: "Australia", flag: "🇦🇺", similarity: 0.90, isLocal: false, genres: ["Psychedelic Rock", "Prog"] }
    ]
  },
  {
    id: "los-prisioneros",
    name: "Los Prisioneros",
    country: "Chile",
    city: "Santiago",
    flag: "🇨🇱",
    genres: ["Punk Rock", "Synth-Pop", "New Wave"],
    popularity: 88,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
    bio: "Banda chilena fundamental integrada por Jorge González, Claudio Narea y Miguel Tapia. Sus letras de profunda protesta social y su fusión synth-pop marcaron a generaciones en América Latina.",
    topTracks: [
      { title: "El Baile de los que Sobran", album: "Pateando Piedras", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/93/9e/e9/939ee999-481e-fbd4-f8c3-0419fb54c67d/mzaf_11889153600901999055.plus.aac.p.m4a" },
      { title: "Estrechez de Corazón", album: "Corazones", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8a/78/ab/8a78abc6-6cff-9af3-94b5-466b19c112fa/mzaf_11413850792753262070.plus.aac.p.m4a" },
      { title: "Tren al Sur", album: "Corazones", duration: "0:30", previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/20/63/0e/20630e16-0f94-f6ae-fdfe-5ccce5587f7f/mzaf_17810564531426867572.plus.aac.p.m4a" }
    ],
    similar: [
      { id: "los-tres", name: "Los Tres", country: "Chile", flag: "🇨🇱", similarity: 0.92, isLocal: true, genres: ["Cueca Rock", "Alternative Rock"] },
      { id: "lucybell", name: "Lucybell", country: "Chile", flag: "🇨🇱", similarity: 0.87, isLocal: true, genres: ["Alternative Rock", "Darkwave"] },
      { id: "electrodomesticos", name: "Electrodomésticos", country: "Chile", flag: "🇨🇱", similarity: 0.85, isLocal: true, genres: ["Experimental", "Post-Punk"] },
      { id: "ases-falsos", name: "Ases Falsos", country: "Chile", flag: "🇨🇱", similarity: 0.83, isLocal: true, genres: ["Indie Rock", "Pop Rock"] },
      { id: "soda-stereo", name: "Soda Stereo", country: "Argentina", flag: "🇦🇷", similarity: 0.88, isLocal: true, genres: ["Post-Punk", "Pop Rock"] },
      { id: "de-saloon", name: "De Saloon", country: "Chile", flag: "🇨🇱", similarity: 0.80, isLocal: true, genres: ["Alternative Rock"] }
    ]
  }
];

// Helper to resolve or procedurally generate extra details for any node
export function getArtistDetails(node) {
  const seedMatch = SEED_ARTISTS.find(a => a.id === node.id);
  if (seedMatch) return seedMatch;

  // Generate clean procedural data for dynamically expanded nodes
  return {
    id: node.id,
    name: node.name,
    country: node.country || "Desconocido",
    city: node.city || "Escena Local",
    flag: node.flag || "🎵",
    genres: node.genres || ["Indie", "Alternative"],
    popularity: Math.floor(65 + Math.random() * 25),
    image: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?auto=format&fit=crop&w=600&q=80`,
    bio: `${node.name} es un proyecto representativo del género ${node.genres?.[0] || 'Alternative'} en ${node.country || 'la escena musical'}. Destaca por sus atmósferas envolventes y sonido distintivo.`,
    topTracks: [
      { title: `Track Esencial - ${node.name}`, album: "Single 2024", duration: "0:30", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3" },
      { title: `Canción Representativa`, album: "Session EP", duration: "0:30", previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3" }
    ],
    similar: []
  };
}
