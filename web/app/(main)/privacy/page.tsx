export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Política de Privacidad
          </h1>
          <p className="text-white/60">Fecha de entrada en vigor: 10/01/2026</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-white/80 text-lg mb-8">
            Esta política describe cómo VersoVivo recopila, usa y protege la información cuando utilizas la app.
          </p>

          <div className="space-y-8">
            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Datos que recopilamos</h2>
              <ul className="space-y-2 text-white/80">
                <li>• Datos de cuenta: correo electrónico y nombre visible</li>
                <li>• Datos de uso: poemas leídos, favoritos y progreso</li>
                <li>• Compras: identificadores de transacción y estado de compra</li>
                <li>• Recogemos correo/teléfono solo para enviar el código de invitación</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Cómo usamos los datos</h2>
              <ul className="space-y-2 text-white/80">
                <li>• Crear y mantener tu cuenta</li>
                <li>• Sincronizar favoritos y acceso a libros</li>
                <li>• Gestionar compras y suscripciones</li>
                <li>• Mejorar la experiencia de la app</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Servicios de terceros</h2>
              <ul className="space-y-2 text-white/80">
                <li>• Firebase (Google) para autenticación y base de datos</li>
                <li>• Apple App Store / Google Play para compras dentro de la app</li>
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Conservación y seguridad</h2>
              <p className="text-white/80">
                Conservamos los datos mientras la cuenta esté activa o sea necesario para prestar el servicio.
                Aplicamos medidas técnicas para proteger la información.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Tus derechos</h2>
              <p className="text-white/80">
                Puedes solicitar acceso, corrección o eliminación de tus datos escribiendo a{' '}
                <a href="mailto:info@poedronomo.com" className="text-[var(--accent)] hover:text-[#FFEC8B] underline">
                  info@poedronomo.com
                </a>
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Menores</h2>
              <p className="text-white/80">
                La app no está dirigida a menores de 13 años.
              </p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--accent)] mb-4">Cambios</h2>
              <p className="text-white/80">
                Podremos actualizar esta política. Los cambios se publicarán en esta página.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
