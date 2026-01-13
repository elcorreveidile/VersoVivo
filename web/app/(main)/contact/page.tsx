'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
            Contacto
          </h1>
          <p className="text-lg text-white/60">
            ¿Tienes dudas o sugerencias? Escríbenos y te responderemos lo antes posible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 border border-green-500/30 text-green-400 mb-4">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Mensaje enviado
                  </h3>
                  <p className="text-white/60">
                    Gracias por contactarnos. Te responderemos pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                      Nombre
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
                      Asunto
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
                      placeholder="¿En qué podemos ayudarte?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-white/40 focus:border-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700]/20"
                      placeholder="Escribe tu mensaje aquí..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
                    size="lg"
                  >
                    Enviar Mensaje
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Email */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                    <a href="mailto:info@poedronomo.com" className="text-[#FFD700] hover:text-[#FFEC8B]">
                      info@poedronomo.com
                    </a>
                    <p className="text-sm text-white/60 mt-1">
                      Respuesta en 24-48 horas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">VersoVivo</h3>
                    <p className="text-white/60 text-sm">
                      Poesía viva en texto, narración, música y video.
                    </p>
                    <p className="text-white/60 text-sm mt-2">
                      Lanzamiento: 18 de enero de 2026
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Platforms */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700]">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Plataformas</h3>
                    <p className="text-white/60 text-sm">
                      Próximamente en:
                    </p>
                    <ul className="text-white/60 text-sm mt-2 space-y-1">
                      <li>• App Store (iOS)</li>
                      <li>• Google Play (Android)</li>
                      <li>• Versión Web</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authors */}
            <Card className="bg-[#FFD700]/5 border-[#FFD700]/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-3">
                  ¿Eres autor?
                </h3>
                <p className="text-white/60 text-sm mb-4">
                  Publica tu libro de poesía en VersoVivo y llega a más lectores.
                </p>
                <a
                  href="mailto:info@poedronomo.com?subject=Publicar mi libro en VersoVivo"
                  className="inline-flex items-center text-[#FFD700] hover:text-[#FFEC8B] text-sm font-medium"
                >
                  Solicita información
                  <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
