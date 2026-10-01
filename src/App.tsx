import React, { useState } from 'react';
import { ConfidentialNote } from './types';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ComposeInspector } from './components/ComposeInspector';
import { DeviceFileExplorer } from './components/DeviceFileExplorer';
import { AdbTerminal } from './components/AdbTerminal';
import { CryptoArchitecture } from './components/CryptoArchitecture';
import { SourceCodeViewer } from './components/SourceCodeViewer';
import { ReadmeReport } from './components/ReadmeReport';
import { StepsWizard } from './components/StepsWizard';
import {
  Smartphone,
  HardDrive,
  Terminal,
  Shield,
  Code2,
  FileText,
  ListChecks,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'phone' | 'inspector' | 'explorer' | 'adb' | 'crypto' | 'code' | 'readme' | 'steps'
  >('phone');

  // Estado con notas de ejemplo iniciales
  const [notes, setNotes] = useState<ConfidentialNote[]>([
    {
      id: 'note_849201',
      title: 'PIN y Clave Bancaria',
      content: 'PIN: 8841 | Clave: Sec#9918 | Tarjeta: 4500-xxxx',
      category: 'bancario',
      timestamp: '19:42:15',
      isEncryptedStored: true,
      isExternalStored: true,
      encryptedKeyCipher: 'AR92J3KLM4091A8SK0192JDJAKL901==',
      encryptedValueCipher: 'AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==',
      rawExternalContent: 'PIN: 8841 | Clave: Sec#9918 | Tarjeta: 4500-xxxx',
    },
    {
      id: 'note_512844',
      title: 'Token de Servicio API',
      content: 'API_KEY: AKIAIOSF9918-SECRET-TOKEN-AUTH',
      category: 'api_tokens',
      timestamp: '19:44:02',
      isEncryptedStored: true,
      isExternalStored: false,
      encryptedKeyCipher: 'AR83HD9201LKS0928374HJAKSLMNZ9==',
      encryptedValueCipher: 'AQ83Kd821ksl81923kjsdkla7182903jskldja81923==',
      rawExternalContent: '',
    },
  ]);

  const handleAddNote = (newNote: ConfidentialNote) => {
    setNotes((prev) => [newNote, ...prev]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearExternal = () => {
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        isExternalStored: false,
      }))
    );
  };

  const navItems = [
    {
      id: 'phone' as const,
      label: 'Simulador Móvil (Compose)',
      icon: Smartphone,
      badge: `${notes.length}`,
    },
    {
      id: 'inspector' as const,
      label: 'Árbol Compose & UI',
      icon: Layers,
      badge: 'Material 3',
    },
    {
      id: 'explorer' as const,
      label: 'Device File Explorer',
      icon: HardDrive,
    },
    {
      id: 'adb' as const,
      label: 'Terminal ADB',
      icon: Terminal,
    },
    {
      id: 'crypto' as const,
      label: 'Arquitectura Cifrado',
      icon: Shield,
    },
    {
      id: 'code' as const,
      label: 'Código Android Studio',
      icon: Code2,
      badge: 'Compose',
    },
    {
      id: 'readme' as const,
      label: 'Informe README.md',
      icon: FileText,
    },
    {
      id: 'steps' as const,
      label: 'Guía de Laboratorio',
      icon: ListChecks,
      badge: '5 pasos',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans selection:bg-[#80EF80] selection:text-gray-950">
      {/* Header Limpio y Profesional */}
      <header className="border-b border-[#BADBA2]/40 bg-white sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-[#42D674]/50 bg-[#153422] flex items-center justify-center text-[#42D674] shadow-xs shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base md:text-lg text-gray-900 tracking-tight leading-tight">
                  Taller 3 – Punto 4: Seguridad y Cifrado en Android
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E3F0A3] text-gray-800 border border-[#BADBA2] font-mono">
                  Jetpack Compose
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#153422] text-[#80EF80] border border-[#42D674]/40 font-mono">
                  AES-256
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Interfaz declarativa con Kotlin & Jetpack Compose • EncryptedSharedPreferences vs Almacenamiento en SD • ADB & Device File Explorer
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Navegación Limpia y Directa */}
        <div className="bg-[#FAFDF9] border-t border-[#BADBA2]/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-[#42D674] text-gray-950 font-bold border-[#42D674] shadow-xs'
                      : 'bg-white text-gray-700 hover:text-gray-900 hover:bg-[#E3F0A3]/30 border-[#BADBA2]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gray-950' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-white text-gray-900'
                          : 'bg-[#E3F0A3] text-gray-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 bg-white space-y-4">
        {/* Banner de Flujo Guiado Interactivo */}
        <div className="bg-[#F8FAF8] border border-[#BADBA2]/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#42D674] animate-pulse"></span>
              <span className="text-xs font-bold text-gray-900">
                Flujo Recomendado de Demostración y Evaluación:
              </span>
            </div>
            {/* Pasos Clickables */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setActiveTab('phone')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'phone'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                1. Guardar Nota (Compose)
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('inspector')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'inspector'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                2. Árbol Compose
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('explorer')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'explorer'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                3. Explorar Archivos
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('adb')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'adb'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                4. Probar ADB
              </button>
              <span className="text-gray-400">→</span>
              <button
                type="button"
                onClick={() => setActiveTab('code')}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-[#42D674] text-gray-950 border-[#42D674] font-bold'
                    : 'bg-white text-gray-700 hover:text-gray-950 border-[#BADBA2]/60'
                }`}
              >
                5. Descargar Proyecto ZIP
              </button>
            </div>
          </div>
        </div>

        {activeTab === 'phone' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <PhoneSimulator
              notes={notes}
              onAddNote={handleAddNote}
              onDeleteNote={handleDeleteNote}
              onClearExternal={handleClearExternal}
              onNavigateToTab={(t) => setActiveTab(t)}
            />
          </div>
        )}

        {activeTab === 'inspector' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <ComposeInspector
              onNavigateToCode={() => setActiveTab('code')}
              onNavigateToPhone={() => setActiveTab('phone')}
            />
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <DeviceFileExplorer notes={notes} />
          </div>
        )}

        {activeTab === 'adb' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <AdbTerminal notes={notes} />
          </div>
        )}

        {activeTab === 'crypto' && (
          <div className="animate-in fade-in duration-150">
            <CryptoArchitecture />
          </div>
        )}

        {activeTab === 'code' && (
          <div className="animate-in fade-in duration-150">
            <SourceCodeViewer />
          </div>
        )}

        {activeTab === 'readme' && (
          <div className="animate-in fade-in duration-150">
            <ReadmeReport />
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="animate-in fade-in duration-150">
            <StepsWizard onNavigateToTab={(t) => setActiveTab(t)} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#BADBA2]/40 bg-[#FAFDF9] py-5 px-4 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">
          Universidad de Nariño • Taller 3 – Persistencia en Android Studio • Punto 4: Seguridad y Cifrado
        </p>
        <p className="text-gray-500 mt-1">
          Arquitectura Jetpack Compose (Material 3) con EncryptedSharedPreferences (Jetpack Security) & Android Keystore vs Almacenamiento Externo SD
        </p>
      </footer>
    </div>
  );
}
