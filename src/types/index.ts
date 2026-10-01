export type SecretCategory =
  | 'bancario'
  | 'credenciales'
  | 'api_tokens'
  | 'cripto_wallets'
  | 'doble_factor'
  | 'identidad'
  | 'medico'
  | 'empresa'
  | 'wifi_redes'
  | 'personal';

export interface ConfidentialNote {
  id: string;
  title: string;
  content: string;
  category: SecretCategory;
  timestamp: string;
  isEncryptedStored: boolean;
  isExternalStored: boolean;
  encryptedKeyCipher: string;
  encryptedValueCipher: string;
  rawExternalContent: string;
}

export interface AndroidCodeFile {
  name: string;
  path: string;
  language: 'kotlin' | 'xml' | 'groovy' | 'toml' | 'markdown';
  description: string;
  category: 'compose_ui' | 'logic' | 'gradle' | 'manifest' | 'doc';
  content: string;
}

export interface ComposeComponentNode {
  name: string;
  composableName: string;
  description: string;
  stateProps: string[];
  composeEquivalent: string;
}
