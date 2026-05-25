'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export default function LandingPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generate_lead', {
        event_category: 'contact',
        event_label: 'bookstore_landing_form',
      });
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090909] to-black text-white">
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="rounded-full border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            Librería independiente
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Encuentra tu próxima lectura favorita en una librería con alma
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/70">
            Catálogo curado, recomendaciones personalizadas y envíos a todo el país. Te ayudamos a descubrir libros que realmente conectan contigo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#contacto">
              <Button size="lg" className="bg-[var(--accent)] text-black hover:bg-[#FFEC8B]">
                Quiero asesoría gratis
              </Button>
            </Link>
            <Link href="/books">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Ver catálogo destacado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
        {[
          ['+5,000', 'Títulos disponibles'],
          ['24h', 'Tiempo medio de respuesta'],
          ['98%', 'Clientes que repiten compra'],
        ].map(([value, label]) => (
          <Card key={label} className="border-white/10 bg-white/5">
            <CardContent className="p-6 text-center">
              <p className="text-3xl font-bold text-[var(--accent)]">{value}</p>
              <p className="mt-2 text-sm text-white/70">{label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section id="contacto" className="border-t border-white/10 py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold">Pide una recomendación personalizada</h2>
            <p className="mt-4 text-white/70">
              Déjanos tus gustos y te enviaremos por correo una selección de libros ideal para ti. Sin compromiso.
            </p>
            <ul className="mt-6 space-y-3 text-white/80">
              <li>✓ Recomendaciones por género y nivel lector</li>
              <li>✓ Opciones para regalo con dedicatoria</li>
              <li>✓ Atención por especialistas en literatura</li>
            </ul>
          </div>

          <Card className="border-[var(--accent)]/20 bg-white/5">
            <CardContent className="p-6">
              {submitted ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-200">
                  ¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input name="name" required placeholder="Nombre" className="border-white/20 bg-black/40 text-white" />
                  <Input name="email" type="email" required placeholder="Correo electrónico" className="border-white/20 bg-black/40 text-white" />
                  <Input name="interest" required placeholder="¿Qué tipo de libros te interesan?" className="border-white/20 bg-black/40 text-white" />
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Cuéntanos tus gustos (autores, géneros, presupuesto...)"
                    className="w-full rounded-md border border-white/20 bg-black/40 p-3 text-sm text-white placeholder:text-white/40"
                  />
                  <Button type="submit" className="w-full bg-[var(--accent)] text-black hover:bg-[#FFEC8B]">
                    Solicitar recomendaciones
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
