import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-black via-[#0a0a0a] to-[#1a1a1a] text-white border-b border-white/10 py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center fade-in">
            <p className="text-[var(--accent)] font-semibold mb-4">Lanzamiento 18 · 01 · 2026</p>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl mb-6">
              Sobre VersoVivo
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/70 sm:text-xl max-w-3xl mx-auto">
              Transformamos libros de poesía en una experiencia inmersiva: lees, escuchas y ves cada poema.
              Una app para lectores y un escaparate para autores.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* La experiencia VersoVivo */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              La Experiencia VersoVivo
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Lectura sin fricción</h3>
                  <p className="text-white/60">
                    Texto limpio, tipografías cuidadas y modos de lectura adaptables.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Narración + Música</h3>
                  <p className="text-white/60">
                    Escucha poemas con voz y música original como parte del mismo libro.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Video-poemas</h3>
                  <p className="text-white/60">
                    Cuando el poema pide imagen, la app lo ofrece con un solo toque.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Para autores */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Para Autores
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Publica tu libro</h3>
                  <p className="text-white/60">
                    Sube poemas, audio, narración y video. VersoVivo se encarga del formato.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Distribución moderna</h3>
                  <p className="text-white/60">
                    QR en el libro físico y acceso digital inmediato para tus lectores.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Ingresos y suscripciones</h3>
                  <p className="text-white/60">
                    Compra por libro o acceso total con suscripción flexible.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Precios */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">
              Precios y Acceso
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-all">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">App + libro incluido</h3>
                  <div className="text-4xl font-bold text-[var(--accent)] mb-4">€2,99</div>
                  <p className="text-white/60">
                    Incluye el libro &quot;Versos sencillos para despistar a la poesía&quot;.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-all">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Libro adicional</h3>
                  <div className="text-4xl font-bold text-[var(--accent)] mb-4">€6,99</div>
                  <p className="text-white/60">
                    Compra individual. Acceso para siempre, sin suscripción.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:border-[var(--accent)]/30 transition-all">
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">Suscripción</h3>
                  <div className="text-4xl font-bold text-[var(--accent)] mb-4">Flexible</div>
                  <p className="text-white/60 mb-2">Mensual / Trimestral / Anual</p>
                  <p className="text-white/60 text-sm">
                    Acceso a todo el catálogo mientras esté activa.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-20">
            <Card className="bg-[var(--accent)]/5 border-[var(--accent)]/20 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] mb-6">
                  <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Lee una muestra antes de comprar
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  Los libros bloqueados muestran varios poemas de forma gratuita.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              18 de enero de 2026
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Pronto en App Store / Google Play
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="bg-[var(--accent)] text-black hover:bg-[#FFEC8B]">
                  Explorar Poemas
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-[var(--accent)] hover:bg-white/10 hover:border-[var(--accent)]/50">
                  Contactar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
