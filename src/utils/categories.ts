import { SecretCategory } from '../types';

export interface CategoryInfo {
  id: SecretCategory;
  label: string;
  shortLabel: string;
  badgeBg: string;
  textColor: string;
  iconName: string;
  sampleHint: string;
}

export const SECRET_CATEGORIES: CategoryInfo[] = [
  {
    id: 'bancario',
    label: 'Bancario & Financiero (PINs, Cuentas, Tarjetas)',
    shortLabel: 'Bancario',
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40',
    textColor: 'text-emerald-300',
    iconName: 'CreditCard',
    sampleHint: 'PIN: 8841 | Clave: Sec#9918 | Tarjeta: 4500-xxxx',
  },
  {
    id: 'credenciales',
    label: 'Credenciales de Acceso (Usuario & Contraseña)',
    shortLabel: 'Credenciales',
    badgeBg: 'bg-blue-950/70 border-blue-500/40',
    textColor: 'text-blue-300',
    iconName: 'Key',
    sampleHint: 'user: admin_root | pass: H@sh!92xLp',
  },
  {
    id: 'api_tokens',
    label: 'API Keys & Tokens (AWS, Firebase, Cloud)',
    shortLabel: 'API Keys',
    badgeBg: 'bg-amber-950/70 border-amber-500/40',
    textColor: 'text-amber-300',
    iconName: 'Code',
    sampleHint: 'API_KEY: AKIAIOSF9918-SECRET-TOKEN-AUTH',
  },
  {
    id: 'cripto_wallets',
    label: 'Cripto & Billeteras (Seed Phrase, Wallets)',
    shortLabel: 'Cripto',
    badgeBg: 'bg-purple-950/70 border-purple-500/40',
    textColor: 'text-purple-300',
    iconName: 'Coins',
    sampleHint: 'Seed: apple monkey jungle river silver dragon 2026',
  },
  {
    id: 'doble_factor',
    label: 'Respaldo 2FA & OTP (Códigos de recuperación)',
    shortLabel: 'Respaldo 2FA',
    badgeBg: 'bg-cyan-950/70 border-cyan-500/40',
    textColor: 'text-cyan-300',
    iconName: 'ShieldAlert',
    sampleHint: 'Recovery: 9182-3849-0192-8472-1029',
  },
  {
    id: 'identidad',
    label: 'Identidad & Documentos (Cédula, Pasaporte)',
    shortLabel: 'Identidad',
    badgeBg: 'bg-indigo-950/70 border-indigo-500/40',
    textColor: 'text-indigo-300',
    iconName: 'Fingerprint',
    sampleHint: 'Doc: CC 1085293841 | Pasaporte: AB771920',
  },
  {
    id: 'medico',
    label: 'Médico & Salud Privada (Historial, Medicación)',
    shortLabel: 'Salud',
    badgeBg: 'bg-rose-950/70 border-rose-500/40',
    textColor: 'text-rose-300',
    iconName: 'HeartPulse',
    sampleHint: 'Historial: Diagnóstico reservado - Folio #7721',
  },
  {
    id: 'empresa',
    label: 'Corporativo & Negocios (Servidores, Contratos)',
    shortLabel: 'Empresa',
    badgeBg: 'bg-slate-800 border-slate-600',
    textColor: 'text-slate-200',
    iconName: 'Building',
    sampleHint: 'SSH: root@192.168.1.100 | Port: 2222',
  },
  {
    id: 'wifi_redes',
    label: 'Redes & Wi-Fi (Claves WPA3, VPN)',
    shortLabel: 'Wi-Fi / VPN',
    badgeBg: 'bg-teal-950/70 border-teal-500/40',
    textColor: 'text-teal-300',
    iconName: 'Wifi',
    sampleHint: 'SSID: SecNet_5G | WPA3: P@ssw0rd!SecureCorp2026',
  },
  {
    id: 'personal',
    label: 'Personal & Privado (Notas confidenciales)',
    shortLabel: 'Personal',
    badgeBg: 'bg-zinc-800 border-zinc-600',
    textColor: 'text-zinc-200',
    iconName: 'Lock',
    sampleHint: 'Confidencial: Combinación caja fuerte: 44-12-88',
  },
];

export function getCategoryInfo(categoryId: SecretCategory): CategoryInfo {
  return (
    SECRET_CATEGORIES.find((c) => c.id === categoryId) || {
      id: categoryId,
      label: categoryId,
      shortLabel: categoryId,
      badgeBg: 'bg-gray-800 border-gray-700',
      textColor: 'text-gray-300',
      iconName: 'Lock',
      sampleHint: 'Información confidencial',
    }
  );
}
