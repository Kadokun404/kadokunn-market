import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kadokun Marketplace',
    short_name: 'Kadokun',
    description: 'Belanja online di Kadokun Marketplace - Nomor Kosong mulai dari 3000',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff3b0',
    theme_color: '#ff6b9d',
    icons: [
      {
        src: 'https://cdn.nekohime.site/file/36kvqkte.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: 'https://cdn.nekohime.site/file/36kvqkte.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  }
}
