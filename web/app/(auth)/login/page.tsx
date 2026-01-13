'use client';

import { useState } from 'react';
import { signIn } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-sm text-white/60">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-[#FFD700] hover:text-[#FFEC8B]">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-900/50 border border-red-500/30 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80">
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/80">
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FFD700]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <Link
              href="/forgot-password"
              className="text-sm text-[#FFD700] hover:text-[#FFEC8B]"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD700] text-black hover:bg-[#FFEC8B]"
            size="lg"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
}
