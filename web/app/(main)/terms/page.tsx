export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Términos y Condiciones
          </h1>
          <p className="text-white/60">Fecha de entrada en vigor: 10/01/2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-white/80 text-lg mb-8">
            Al usar VersoVivo aceptas estos términos. Si no estás de acuerdo, no utilices la app.
          </p>

          <div className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Uso de la app</h2>
              <ul className="space-y-2 text-white/80">
                <li>• La app ofrece acceso a libros, audio y contenido audiovisual</li>
                <li>• No está permitido copiar o redistribuir el contenido sin permiso</li>
                <li>• El acceso puede depender de compras o suscripciones activas</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Compras y suscripciones</h2>
              <ul className="space-y-2 text-white/80">
                <li>• Las compras dentro de la app se gestionan por Apple o Google</li>
                <li>• Las suscripciones se renuevan según las condiciones de la tienda</li>
                <li>• El contenido comprado permanece disponible según la política de la tienda</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Cuenta y seguridad</h2>
              <p className="text-white/80">
                Eres responsable de la confidencialidad de tu cuenta. Si detectas un uso no autorizado,{' '}
                <a href="mailto:info@poedronomo.com" className="text-[var(--accent)] hover:text-[#FFEC8B] underline">
                  escríbenos
                </a>
                .
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Limitación de responsabilidad</h2>
              <p className="text-white/80">
                VersoVivo se ofrece &quot;tal cual&quot;. No garantizamos disponibilidad continua ni la ausencia total de errores.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Cambios</h2>
              <p className="text-white/80">
                Podemos actualizar estos términos. Los cambios se publicarán en esta página.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Contacto</h2>
              <p className="text-white/80">
                Para dudas o soporte:{' '}
                <a href="mailto:info@poedronomo.com" className="text-[var(--accent)] hover:text-[#FFEC8B] underline">
                  info@poedronomo.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
