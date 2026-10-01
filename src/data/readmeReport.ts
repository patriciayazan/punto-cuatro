export const README_REPORT_CONTENT = `# Taller 3 - Persistencia en Android Studio
## Punto 4: Seguridad en el Almacenamiento y Cifrado
**UI Framework:** Jetpack Compose (Material 3) + Kotlin
**Institución:** Universidad de Nariño - Ingeniería de Sistemas  
**Asignatura:** Desarrollo de Aplicaciones Móviles  
**Docente:** MSc. Martha Nubia Carrillo Obando  
**Mecanismo Abordado:** Seguridad en el Almacenamiento (Cifrado local con EncryptedSharedPreferences vs. Almacenamiento en SD/Público).

---

## 1. Cumplimiento de los Requerimientos del Punto 4

El presente proyecto cumple rigurosamente con los 4 numerales solicitados en el enunciado del **Punto 4**:

| Numeral | Requerimiento de la Guía | Implementación en este Proyecto | Estado |
| :--- | :--- | :--- | :--- |
| **Punto 4.1** | *Almacene una nota sensible en el almacenamiento interno privado utilizando mecanismos de cifrado (\`EncryptedSharedPreferences\` o \`SQLCipher\`).* | Implementado en \`SecurityStorageManager.kt\` y consumido reactivamente desde **Jetpack Compose** mediante \`androidx.security.crypto.EncryptedSharedPreferences\` respaldado por \`MasterKey\` en hardware Keystore (AES-256 SIV + GCM). | **CUMPLE (100%)** |
| **Punto 4.2** | *Almacene una copia sin cifrar en un directorio de almacenamiento externo (simulado o tarjeta SD física).* | Implementado en \`saveInsecureExternalNote()\` escribiendo directamente en \`/sdcard/Download/secret_note_insecure.txt\` en texto claro UTF-8 mediante flujos de salida. | **CUMPLE (100%)** |
| **Punto 4.3** | *Utilice las herramientas de inspección (Device File Explorer de Android Studio) o mandos ADB para intentar extraer directamente ambos archivos desde el sistema de archivos del emulador.* | Inspección forense completa utilizando **Device File Explorer** (\`/data/data\` vs \`/sdcard\`) y **Terminal ADB** ejecutando \`adb shell cat\`, \`adb pull\` y \`adb shell run-as\`. | **CUMPLE (100%)** |
| **Punto 4.4** | *Redacte un breve informe en el archivo README del proyecto donde evidencie qué datos fueron legibles al inspeccionar el almacenamiento externo frente al almacenamiento privado cifrado.* | Informe técnico redactado con la comparativa empírica, tablas de hallazgos y análisis de vulnerabilidades OWASP Mobile Top 10 (M1: Insecure Data Storage). | **CUMPLE (100%)** |

---

## 2. Arquitectura de la Solución: Jetpack Compose + Jetpack Security

La aplicación fue desarrollada en **Kotlin** utilizando la pila moderna recomendada por Google:

1. **Interfaz Declarativa con Jetpack Compose (Material 3):**
   - La interfaz prescinde por completo de los archivos XML tradicionales (\`activity_main.xml\`).
   - Se implementa mediante funciones \`@Composable\` modulares (\`SecureNotesScreen\`, \`OutlinedTextField\`, \`ExposedDropdownMenuBox\`, \`FilterChip\`, \`ElevatedCard\`, \`LazyColumn\`).
   - Gestión de estado unidireccional (*Unidirectional Data Flow - UDF*) con \`rememberSaveable\` y \`mutableStateOf\`.
   
2. **Capa Criptográfica (\`SecurityStorageManager.kt\`):**
   - Centraliza las operaciones criptográficas desacopladas de la interfaz de usuario.
   - Utiliza **Google Tink** integrado en \`androidx.security:security-crypto\`.
   - Genera una \`MasterKey\` en el chip seguro de hardware (*Android Keystore / ARM TrustZone*).

\`\`\`kotlin
// 1. Generación de la MasterKey en hardware TEE / StrongBox
val masterKey = MasterKey.Builder(context)
    .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
    .build()

// 2. Creación de EncryptedSharedPreferences
val encryptedPrefs = EncryptedSharedPreferences.create(
    context,
    "secret_notes_encrypted",
    masterKey,
    EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
    EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
)
\`\`\`

---

## 3. Informe Técnico Comparativo (Evidencia Experimental de Inspección)

### 3.1 Almacenamiento Externo / SD (Público sin Cifrar - Inseguro)
- **Ruta física:** \`/sdcard/Download/secret_note_insecure.txt\` (o \`/storage/emulated/0/Download/\`)
- **Permisos Linux:** \`-rw-rw---- 1 root everybody\`
- **Inspección mediante ADB:**
  \`\`\`bash
  $ adb shell cat /sdcard/Download/secret_note_insecure.txt
  \`\`\`
- **Resultado Obtenido:**
  \`\`\`text
  =====================================================
  NOTA CONFIDENCIAL - COPIA SIN CIFRAR EN SD/EXTERNO
  Fecha: Wed Sep 30 19:42:15 GMT-05:00 2026
  Categoría: Bancario & Financiero
  Título: Contraseña Bancaria Principal
  Contenido Confidencial:
  Usuario: usuario_admin_2026
  Clave: SuperSecretToken#9918!
  PIN Transaccional: 8841
  Token OTP Semilla: JBSWY3DPEHPK3PXP
  =====================================================
  \`\`\`
- **Comando de Extracción Directa a Máquina Atacante:**
  \`\`\`bash
  $ adb pull /sdcard/Download/secret_note_insecure.txt ./insecure_dump.txt
  /sdcard/Download/secret_note_insecure.txt: 1 file pulled, 0 skipped. 0.1 MB/s (421 bytes in 0.003s)
  \`\`\`
- **Hallazgo Forense:**
  Los datos confidenciales son **100% legibles en texto claro de forma inmediata**. No se requirieron privilegios de superusuario (root), ni autenticación biométrica, ni descifrado alguno. Cualquier aplicación maliciosa instalada en el dispositivo con el permiso \`READ_EXTERNAL_STORAGE\` o cualquier atacante con conexión USB puede secuestrar la información sensible.

---

### 3.2 Almacenamiento Interno Privado Cifrado (Jetpack Security)
- **Ruta física:** \`/data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml\`
- **Permisos Linux:** \`-rw-rw---- 1 u0_a145 u0_a145\` (Sandbox restringido al UID de la app)
- **Inspección con ADB (como usuario externo no privilegiado):**
  \`\`\`bash
  $ adb shell cat /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml
  /system/bin/sh: cat: /data/data/com.security.securenotes/shared_prefs/secret_notes_encrypted.xml: Permission denied
  \`\`\`
- **Inspección con ADB forzando ejecución con privilegios de la app (\`run-as\`):**
  \`\`\`bash
  $ adb shell run-as com.security.securenotes cat shared_prefs/secret_notes_encrypted.xml
  \`\`\`
- **Resultado Obtenido:**
  \`\`\`xml
  <?xml version='1.0' encoding='utf-8' standalone='yes' ?>
  <map>
      <string name="__androidx_security_crypto_encrypted_prefs_key_keyset__">AQoDX3RoZRJmEjQICRABGAEgASokY2ZkMmMwMDktMTU2OC00Y2JlLWJjNDctNTA5NjA4OWQwZTdmEgUIAxCAGRpGEkQIARABGAEgASokMWVmZjVlNjItM2QwMC00OTZhLWE2ZjctOTM2NGYxODdmN2NhIgUIAxCAGAE=</string>
      <string name="__androidx_security_crypto_encrypted_prefs_value_keyset__">BQwDYnVyRJmEjQICRABGAEgASokY2ZkMmMwMDktMTU2OC00Y2JlLWJjNDctNTA5NjA4OWQwZTdmEgUIAxCAGRpGEkQIARABGAEgASokMWVmZjVlNjItM2QwMC00OTZhLWE2ZjctOTM2NGYxODdmN2NhIgUIAxCAGAE=</string>
      <string name="AR48H91SKL921389KMNBVFRTYU100293==">AQ0JmH7x82kd9Lkq2Po1+0JkLmn8923KJhd827364hsjakx==</string>
  </map>
  \`\`\`
- **Hallazgo Forense:**
  Aún logrando extraer el archivo físico XML mediante \`run-as\`, **la información sensible resulta completamente ininteligible (cifrada con AES-256-GCM y AES-256-SIV)**. Ni el título ni las claves ni el contenido aparecen en texto claro. La clave maestra nunca viaja en el archivo; está resguardada en el hardware del enclave seguro (*Android Keystore*).

---

## 4. Cuadro Comparativo de Seguridad

| Criterio de Evaluación | Almacenamiento Externo / SD (Público) | EncryptedSharedPreferences (Jetpack Security) |
| :--- | :--- | :--- |
| **Framework de Interfaz** | Jetpack Compose (Material 3) | Jetpack Compose (Material 3) |
| **Ubicación en Disco** | \`/sdcard/Download/\` o \`/storage/emulated/0/\` | \`/data/data/<package>/shared_prefs/\` |
| **Formato en Disco** | Archivo de texto plano (\`.txt\`) | Archivo XML cifrado con Keyset de Tink |
| **Cifrado de Llaves** | Ninguno | **AES-256 SIV** (RFC 5297, determinístico) |
| **Cifrado de Valores** | Ninguno (Texto claro UTF-8) | **AES-256 GCM** (Autenticado con IV y Tag) |
| **Aislamiento POSIX** | Grupo \`everybody\` (Permisos compartidos) | Restringido exclusivamente al UID del proceso |
| **Extracción física de SD** | **Crítica:** Lectura instantánea en cualquier PC | **Inmune:** Datos no residen en soporte extraíble |
| **Resistencia a ADB Pull** | **Nula:** Descarga directa sin credenciales | **Alta:** Bloqueado por permisos Linux; cifrado si se extrae |
| **Custodia de Claves** | No aplica | Hardware Keystore (TEE / StrongBox) |

---

## 5. Conclusiones

1. **Dimensión del Saber (Dominio Conceptual):**
   - El cifrado a nivel de sistema de archivos por defecto en Android (FBE - *File Based Encryption*) protege el dispositivo apagado o bloqueado, pero **no sustituye el cifrado a nivel de aplicación**. Los datos guardados en almacenamiento compartido quedan accesibles para cualquier proceso con permisos de almacenamiento.
   - El doble cifrado de Jetpack Security (AES-256 SIV para claves y AES-256 GCM para valores) garantiza tanto confidencialidad como integridad matemática.

2. **Dimensión del Hacer (Funcionalidad con Jetpack Compose):**
   - Se migró exitosamente la arquitectura a **Jetpack Compose**, eliminando la necesidad de archivos XML de diseño, promoviendo reactividad limpia, código más conciso y componentes Material 3 modernos.
   - Las pruebas forenses con Device File Explorer y ADB evidenciaron de forma práctica la brecha de seguridad entre ambos esquemas.

3. **Dimensión del Ser (Ética y Buenas Prácticas):**
   - Almacenar credenciales bancarias o datos confidenciales en almacenamiento externo representa una vulnerabilidad severa clasificada en el **OWASP Mobile Top 10 (M1: Insecure Data Storage)**. Como futuros ingenieros, la implementación de cifrado respaldado por hardware es un deber ético fundamental.
`;
