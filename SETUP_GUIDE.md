# 🚀 GUÍA COMPLETA DE SETUP - VERSOVIVO

## 📋 TABLA DE CONTENIDOS
1. [Stack Tecnológico](#stack-tecnológico)
2. [Prerequisitos](#prerequisitos)
3. [Configuración Inicial](#configuración-inicial)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Configuración de Firebase](#configuración-de-firebase)
6. [Implementaciones Clave](#implementaciones-clave)
7. [Variables de Entorno](#variables-de-entorno)
8. [Instalación y Desarrollo](#instalación-y-desarrollo)
9. [Deployment a Vercel](#deployment-a-vercel)
10. [Troubleshooting](#troubleshooting)

---

## 🛠️ STACK TECNOLÓGICO

### Frontend Web (Next.js)
- **Framework:** Next.js 16.1.1 (App Router)
- **Runtime:** React 18+ con Turbopack
- **Lenguaje:** TypeScript 5.x
- **Estilos:** Tailwind CSS 4.x
- **Autenticación:** Firebase Auth
- **Base de Datos:** Firebase Firestore
- **Hosting:** Vercel
- **Build Tool:** Turbopack

### Frontend Móvil (React Native)
- **Framework:** React Native (Expo)
- **Estado Global:** Redux Toolkit
- **Navegación:** React Navigation
- **Almacenamiento:** AsyncStorage

### Backend/Cloud
- **BaaS:** Firebase (Auth, Firestore, Storage)
- **Funciones:** Firebase Functions (opcional)
- **CDN:** Vercel Edge Network

---

## 📦 PREREQUISITOS

### Software Requerido
```bash
Node.js >= 18.x (recomendado 20.x)
npm >= 9.x o pnpm >= 8.x
Git >= 2.x
```

### Cuentas Necesarias
- Cuenta de GitHub
- Cuenta de Firebase (Google Cloud)
- Cuenta de Vercel
- (Opcional) Cuenta de OpenAI para generación de música/voz

---

## 🏗️ CONFIGURACIÓN INICIAL

### 1. Clonar el Repositorio
```bash
git clone https://github.com/elcorreveidile/VersoVivo.git
cd VersoVivo
```

### 2. Estructura de Directorios
```
VersoVivo/
├── src/                    # App móvil React Native
│   ├── components/
│   ├── screens/
│   ├── services/
│   │   └── firebase/
│   ├── store/
│   │   └── slices/
│   ├── types/
│   └── navigation/
├── web/                    # App web Next.js
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (main)/
│   │   ├── admin/
│   │   ├── poem/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── layout/
│   │   ├── providers/     # ⭐ IMPORTANTE
│   │   └── ui/
│   ├── contexts/          # ⭐ IMPORTANTE
│   │   ├── AudioContext.tsx
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── firebase/
│   ├── types/
│   └── public/
└── SETUP_GUIDE.md         # Este archivo
```

---

## 🔥 CONFIGURACIÓN DE FIREBASE

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea nuevo proyecto: "VersoVivo"
3. Habilita Google Analytics (opcional)

### 2. Configurar Authentication

```bash
Firebase Console → Authentication → Get Started
```

**Métodos de autenticación a habilitar:**
- ✅ Email/Password
- ✅ Google Sign-In (opcional)

**Dominios autorizados:**
- `localhost`
- `versovivo.ai`
- `*.vercel.app`

### 3. Configurar Firestore Database

```bash
Firebase Console → Firestore Database → Create Database
```

**Modo inicial:** Producción
**Ubicación:** `us-central1` (o la más cercana)

### 4. Reglas de Seguridad de Firestore

**IMPORTANTE:** Copia estas reglas exactamente en Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // ⭐ IMPORTANTE: Acepta Custom Claims O role en BD
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.admin == true ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }

    function isEditor() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'editor';
    }

    function isAdminOrEditor() {
      return isAdmin() || isEditor();
    }

    function isAdminEmail() {
      return isSignedIn() &&
        request.auth.token.email != null &&
        request.auth.token.email == 'informa@blablaele.com'; // ⚠️ CAMBIAR
    }

    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isOwner(userId) &&
        (
          !('role' in request.resource.data) ||
          request.resource.data.role == 'user' ||
          (request.resource.data.role == 'admin' && isAdminEmail())
        );
      allow update: if isOwner(userId) &&
        request.resource.data.role == resource.data.role &&
        request.resource.data.diff(resource.data).changedKeys().hasOnly([
          'displayName',
          'photoURL',
          'favoritePoems',
          'readPoems',
          'listenedPoems',
          'watchedPoems',
          'subscription',
          'preferences',
          'lastLoginAt'
        ]);
      allow delete: if isAdmin();
      allow write: if isAdmin();
    }

    // Poems collection
    match /poems/{poemId} {
      allow read: if true;
      allow create, update, delete: if isAdminOrEditor();
    }

    // Books collection
    match /books/{bookId} {
      allow read: if true;
      allow create, update, delete: if isAdminOrEditor();
    }

    // Purchases collection
    match /purchases/{purchaseId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if false;
      allow update, delete: if isAdmin();
    }

    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // ⭐ Activity Log collection
    match /activityLog/{logId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Crear Índices en Firestore

```bash
Firestore → Indexes → Create Index
```

**Índices necesarios:**

1. **Poems Collection:**
   - `createdAt` (Descending)
   - `author` (Ascending) + `createdAt` (Descending)
   - `tags` (Array) + `createdAt` (Descending)

2. **Books Collection:**
   - `createdAt` (Descending)
   - `author` (Ascending) + `createdAt` (Descending)

3. **Activity Log:**
   - `timestamp` (Descending)
   - `adminId` (Ascending) + `timestamp` (Descending)

### 6. Obtener Credenciales de Firebase

```bash
Firebase Console → Project Settings → General
```

**Para Web:**
Copia la configuración de "Your apps" → Web app:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

**Para móvil:**
- Android: Descargar `google-services.json`
- iOS: Descargar `GoogleService-Info.plist`

### 7. Crear Primer Usuario Admin

**Opción A: Desde Firebase Console**
```bash
Authentication → Users → Add User
Email: tu-email@example.com
Password: (genera una segura)
```

Luego, en Firestore:
```bash
Firestore → users → (tu-uid) → Editar
Agregar campo:
  role: "admin"
```

**Opción B: Usando Custom Claims (Recomendado)**
```javascript
// En Firebase Functions o Admin SDK
admin.auth().setCustomUserClaims(uid, { admin: true });
```

---

## 🎯 IMPLEMENTACIONES CLAVE

### 1. AudioContext Global (Persistencia de Audio)

**Archivo:** `/web/contexts/AudioContext.tsx`

**Propósito:** Mantener un solo reproductor de audio que persista entre navegaciones.

**Características:**
- Estado global compartido
- Un solo elemento `<audio>` HTML5
- Funciones: `play()`, `pause()`, `resume()`, `stop()`, `seek()`
- Tracking de: `currentUrl`, `currentType`, `currentPoemId`, `isPlaying`, `currentTime`, `duration`

**Implementación completa:**

```typescript
'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

type AudioType = 'voice' | 'music' | 'video' | null;

interface AudioContextType {
  // State
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  currentUrl: string | null;
  currentType: AudioType;
  currentPoemId: string | null;

  // Actions
  play: (url: string, type: AudioType, poemId: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;

  // Helpers
  isCurrentAudio: (url: string) => boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [currentType, setCurrentType] = useState<AudioType>(null);
  const [currentPoemId, setCurrentPoemId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number>();

  // Create audio element if it doesn't exist
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('ended', handleEnded);
      audioRef.current.addEventListener('error', handleError);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update current time while playing
  useEffect(() => {
    if (isPlaying) {
      const updateTime = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
        animationFrameRef.current = requestAnimationFrame(updateTime);
      };
      animationFrameRef.current = requestAnimationFrame(updateTime);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleError = useCallback((e: Event) => {
    console.error('Audio error:', e);
    setIsPlaying(false);
  }, []);

  const play = useCallback((url: string, type: AudioType, poemId: string) => {
    if (!audioRef.current) return;

    // Si es el mismo audio, solo resume
    if (currentUrl === url) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
      return;
    }

    // Nuevo audio: detener el actual y cargar el nuevo
    audioRef.current.pause();
    audioRef.current.src = url;
    audioRef.current.load();

    setCurrentUrl(url);
    setCurrentType(type);
    setCurrentPoemId(poemId);
    setCurrentTime(0);

    audioRef.current.play().catch(err => console.error('Play error:', err));
    setIsPlaying(true);
  }, [currentUrl]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current && currentUrl) {
      audioRef.current.play().catch(err => console.error('Play error:', err));
      setIsPlaying(true);
    }
  }, [currentUrl]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentUrl(null);
      setCurrentType(null);
      setCurrentPoemId(null);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const isCurrentAudio = useCallback((url: string) => {
    return currentUrl === url;
  }, [currentUrl]);

  const value: AudioContextType = {
    isPlaying,
    currentTime,
    duration,
    currentUrl,
    currentType,
    currentPoemId,
    play,
    pause,
    resume,
    stop,
    seek,
    isCurrentAudio,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
```

### 2. ClientProviders Wrapper

**Archivo:** `/web/components/providers/ClientProviders.tsx`

**Propósito:** Wrapper con `'use client'` para manejar contextos en Next.js 13+ App Router.

```typescript
'use client';

import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AudioProvider, useAudio } from '@/contexts/AudioContext';
import { Toaster } from '@/components/ui/toast';

// Component to handle audio cleanup on logout
function AudioCleanupOnLogout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const audio = useAudio();

  useEffect(() => {
    // Si el usuario se desloguea (user pasa de tener valor a null), detener el audio
    if (user === null) {
      audio.stop();
    }
  }, [user, audio]);

  return <>{children}</>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AudioProvider>
        <AudioCleanupOnLogout>
          <Toaster>
            {children}
          </Toaster>
        </AudioCleanupOnLogout>
      </AudioProvider>
    </AuthProvider>
  );
}
```

### 3. Layout Principal

**Archivo:** `/web/app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ClientProviders } from "@/components/providers/ClientProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VersoVivo - Poesía que cobra vida",
  description: "Una experiencia inmersiva de videopoemas que combina texto, recitación y música generada por IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ClientProviders>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}
```

### 4. Página de Detalle de Poema con Audio Persistente

**Archivo:** `/web/app/poem/[id]/page.tsx`

**Puntos clave:**

```typescript
import { useAudio } from '@/contexts/AudioContext';

const audio = useAudio();

// Handle view mode changes with audio logic
const handleViewModeChange = (newMode: ViewMode) => {
  if (!poem) return;

  // Si cambiamos a video, detener cualquier audio
  if (newMode === 'video') {
    audio.stop();
  }

  // Si cambiamos a music, reproducir música (detendrá voice si estaba activo)
  if (newMode === 'music' && poem.musicUrl) {
    audio.play(poem.musicUrl, 'music', poem.id);
  }

  // Si cambiamos a voice, reproducir voz (detendrá music si estaba activo)
  if (newMode === 'voice' && poem.voiceUrl) {
    audio.play(poem.voiceUrl, 'voice', poem.id);
  }

  // Si cambiamos a text, NO hacemos nada con el audio (continúa)

  setViewMode(newMode);
};

// Show audio player if audio is playing and we're in text mode
const showPersistentAudioPlayer = audio.isPlaying && audio.currentPoemId === poem.id && viewMode === 'text';

// En el JSX, dentro de viewMode === 'text':
{showPersistentAudioPlayer && (
  <div className="mt-8 p-4 bg-black/30 border border-[#FFD700]/20 rounded-lg">
    <div className="flex items-center gap-3 mb-3">
      <button
        onClick={() => audio.isPlaying ? audio.pause() : audio.resume()}
        className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center hover:bg-[#FFEC8B] transition-colors"
      >
        <span className="text-black text-lg">{audio.isPlaying ? '⏸' : '▶'}</span>
      </button>
      <button
        onClick={() => audio.stop()}
        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
      >
        <span className="text-white text-lg">⏹</span>
      </button>
      <div className="flex-1">
        <p className="text-xs text-white/60">
          {audio.currentType === 'music' ? '🎵 Reproduciendo música' : '🎙️ Reproduciendo narración'}
        </p>
      </div>
    </div>
    <input
      type="range"
      min="0"
      max={audio.duration || 0}
      value={audio.currentTime}
      onChange={(e) => audio.seek(parseFloat(e.target.value))}
      className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
    />
    <div className="flex justify-between text-xs text-white/40 mt-1">
      <span>{formatTime(audio.currentTime)}</span>
      <span>{formatTime(audio.duration)}</span>
    </div>
  </div>
)}
```

### 5. Función updatePoem Corregida

**Archivo:** `/web/lib/firebase/admin.ts`

**IMPORTANTE:** Esta implementación asegura que todos los campos se guarden correctamente.

```typescript
export const updatePoem = async (poemId: string, poem: Partial<Poem>): Promise<{ success: boolean; error?: string }> => {
  try {
    const poemRef = doc(db, POEMS_COLLECTION, poemId);

    // DEBUG: Log what we're receiving
    console.log('📝 updatePoem called with:', { poemId, poem });
    console.log('📝 Title in poem object:', poem.title);
    console.log('📝 All keys in poem:', Object.keys(poem));

    // Build update object - only include fields that have actual values
    const updateData: Record<string, any> = {};

    // Required fields - include if present and not empty
    if (poem.title !== undefined && poem.title.trim() !== '') {
      updateData.title = poem.title.trim();
    }
    if (poem.author !== undefined && poem.author.trim() !== '') {
      updateData.author = poem.author.trim();
    }
    if (poem.content !== undefined && poem.content.trim() !== '') {
      updateData.content = poem.content.trim();
    }

    // Optional fields - include if present and not empty
    if (poem.category !== undefined && poem.category.trim() !== '') {
      updateData.category = poem.category.trim();
    }
    if (poem.tags !== undefined) {
      updateData.tags = poem.tags;
    }
    if (poem.videoUrl !== undefined && poem.videoUrl.trim() !== '') {
      updateData.videoUrl = poem.videoUrl.trim();
    }
    if (poem.musicUrl !== undefined && poem.musicUrl.trim() !== '') {
      updateData.musicUrl = poem.musicUrl.trim();
    }
    if (poem.voiceUrl !== undefined && poem.voiceUrl.trim() !== '') {
      updateData.voiceUrl = poem.voiceUrl.trim();
    }
    if (poem.thumbnailUrl !== undefined && poem.thumbnailUrl.trim() !== '') {
      updateData.thumbnailUrl = poem.thumbnailUrl.trim();
    }
    if (poem.bookId !== undefined && poem.bookId.trim() !== '') {
      updateData.bookId = poem.bookId.trim();
    }
    if (poem.contentSpanish !== undefined && poem.contentSpanish.trim() !== '') {
      updateData.contentSpanish = poem.contentSpanish.trim();
    }
    if (poem.originalLanguage !== undefined && poem.originalLanguage.trim() !== '') {
      updateData.originalLanguage = poem.originalLanguage.trim();
    }

    // Always update timestamp
    updateData.updatedAt = new Date();

    // DEBUG: Log what we're sending to Firestore
    console.log('📝 Final updateData:', updateData);
    console.log('📝 Title in updateData:', updateData.title);
    console.log('📝 All keys in updateData:', Object.keys(updateData));

    if (Object.keys(updateData).length <= 1) {
      // Only updatedAt, nothing else to update
      console.warn('⚠️ No fields to update besides timestamp');
      return { success: false, error: 'No hay campos para actualizar' };
    }

    await updateDoc(poemRef, updateData);

    console.log('✅ updateDoc completed successfully');

    return { success: true };
  } catch (error: any) {
    console.error('❌ updatePoem error:', error);
    return { success: false, error: error.message };
  }
};
```

### 6. Estilos CSS para Slider de Audio

**Archivo:** `/web/app/globals.css`

Agregar al final del archivo:

```css
/* Audio slider styles */
input[type="range"].slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"].slider::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.2);
  height: 0.25rem;
  border-radius: 9999px;
}

input[type="range"].slider::-moz-range-track {
  background: rgba(255, 255, 255, 0.2);
  height: 0.25rem;
  border-radius: 9999px;
}

input[type="range"].slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.2s ease;
}

input[type="range"].slider::-moz-range-thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease;
}

input[type="range"].slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

input[type="range"].slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}
```

### 7. Manejo de Errores en Home Page

**Archivo:** `/web/app/page.tsx`

```typescript
const loadFeaturedPoems = async () => {
  setLoading(true);
  try {
    const featured = await getFeaturedPoems(6);
    setPoems(featured);
  } catch (error) {
    console.error('Error loading featured poems:', error);
    setPoems([]);
  } finally {
    // Asegurar que loading siempre se ponga en false
    setLoading(false);
  }
};
```

---

## 🔐 VARIABLES DE ENTORNO

### Web App (`/web/.env.local`)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: OpenAI for content generation
OPENAI_API_KEY=sk-...

# Optional: Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=...
```

### Mobile App (`/src/config/firebase.ts`)

```typescript
export const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

---

## 🚀 INSTALACIÓN Y DESARROLLO

### Web App

```bash
cd web
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Mobile App

```bash
cd ../
npm install
npx expo start
```

Escanea el QR con Expo Go app.

---

## 📤 DEPLOYMENT A VERCEL

### 1. Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com)
2. New Project → Import Git Repository
3. Selecciona `VersoVivo`
4. Root Directory: `web`

### 2. Configurar Variables de Entorno

En Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 3. Configurar Build Settings

```bash
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: web
Node.js Version: 20.x
```

### 4. Deploy

```bash
git push origin main
```

Vercel desplegará automáticamente.

### 5. Configurar Dominio Personalizado

Vercel Dashboard → Domains → Add Domain:
- `www.versovivo.ai`
- `versovivo.ai`

Actualizar DNS según instrucciones de Vercel.

---

## 🐛 TROUBLESHOOTING

### Problema: Audio no persiste entre modos

**Solución:**
1. Verifica que `AudioProvider` esté en `ClientProviders.tsx`
2. Verifica que `ClientProviders` tenga directiva `'use client'`
3. Verifica que `layout.tsx` use `<ClientProviders>`
4. Limpia caché de build: Vercel → Redeploy sin caché

### Problema: Título no se guarda en Firestore

**Solución:**
1. Verifica reglas de Firestore (función `isAdmin()`)
2. Verifica que el usuario tenga `role: 'admin'` en Firestore
3. Revisa la consola del navegador para errores
4. Verifica que `updatePoem()` use la implementación correcta

### Problema: Poemas destacados parpadeantes en Chrome móvil

**Solución:**
1. Verifica que `loadFeaturedPoems()` tenga `try/catch/finally`
2. Verifica que `finally` siempre ejecute `setLoading(false)`

### Problema: Build falla en Vercel

**Posibles causas:**
- Variables de entorno faltantes
- Errores de TypeScript
- Importaciones incorrectas

**Solución:**
```bash
# Localmente:
cd web
npm run build

# Si hay errores, córrigelos antes de push
```

### Problema: Custom Claims no funcionan

**Solución (usar role en BD):**
Las reglas de Firestore ya están configuradas para aceptar AMBOS:
- Custom Claims: `request.auth.token.admin == true`
- Role en BD: `get(...).data.role == 'admin'`

---

## 📚 RECURSOS ADICIONALES

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Native Docs](https://reactnative.dev/docs)
- [Vercel Docs](https://vercel.com/docs)

### Repositorio
- GitHub: https://github.com/elcorreveidile/VersoVivo
- Issues: https://github.com/elcorreveidile/VersoVivo/issues

### Contacto
- Email admin: informa@blablaele.com
- Sitio web: https://www.versovivo.ai

---

## 📝 NOTAS FINALES

### Commits Importantes
- `0bb53bd` - feat: implement persistent audio playback across view modes
- `e0b7c9e` - fix: rebuild updatePoem to explicitly handle each field
- `39201ef` - fix: audio persistence and logout cleanup

### Testing Checklist
- [ ] Audio continúa de música → texto
- [ ] Audio se detiene al cambiar a video
- [ ] Audio se detiene al hacer logout
- [ ] Título persiste después de editar y cerrar sesión
- [ ] Poemas destacados cargan correctamente en móvil
- [ ] Admin puede crear/editar/eliminar poemas
- [ ] Usuarios pueden agregar favoritos
- [ ] Autenticación funciona correctamente

### Próximos Pasos Recomendados
1. Implementar tests automatizados (Jest, React Testing Library)
2. Agregar analytics (Google Analytics, Vercel Analytics)
3. Implementar SEO optimization (metadata, sitemap)
4. Agregar PWA support
5. Implementar notificaciones push
6. Agregar modo offline (Service Workers)

---

**Versión del documento:** 1.0
**Última actualización:** Enero 2026
**Autor:** Claude + elcorreveidile Team
