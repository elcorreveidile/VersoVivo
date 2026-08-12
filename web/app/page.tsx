import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Librería | Recomendaciones personalizadas y catálogo curado',
  description:
    'Página de aterrizaje de una librería con catálogo curado, recomendación personalizada, formulario de contacto y experiencia de compra rápida.',
  keywords: ['librería', 'libros', 'recomendaciones de lectura', 'catálogo de libros', 'comprar libros online'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Librería | Descubre tu próxima lectura favorita',
    description:
      'Explora libros recomendados, solicita asesoría gratuita y compra en una librería independiente con atención personalizada.',
    type: 'website',
    locale: 'es_ES',
  },
};

export default function HomePage() {
  return <LandingPage />;
}
