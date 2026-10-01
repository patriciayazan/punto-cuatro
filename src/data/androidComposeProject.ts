import { AndroidCodeFile } from '../types';

export const ANDROID_COMPOSE_FILES: AndroidCodeFile[] = [
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/com/security/securenotes/MainActivity.kt',
    language: 'kotlin',
    category: 'compose_ui',
    description: 'Punto de entrada Jetpack Compose: ComponentActivity con setContent y arquitectura declarativa',
    content: `package com.security.securenotes

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.security.securenotes.ui.screens.SecureNotesScreen
import com.security.securenotes.ui.theme.SecureNotesTheme

/**
 * Taller 3 - Punto 4: Seguridad y Cifrado en Android
 * Implementación de interfaz de usuario con JETPACK COMPOSE (Material 3)
 *
 * Actividad principal que inicializa el árbol de composables, gestiona permisos
 * en tiempo de ejecución para almacenamiento externo y conecta el SecurityStorageManager.
 */
class MainActivity : ComponentActivity() {

    private lateinit var storageManager: SecurityStorageManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Inicializar el gestor de almacenamiento seguro respaldado por Android Keystore
        storageManager = SecurityStorageManager(applicationContext)

        setContent {
            SecureNotesTheme {
                // Solicitar permisos de almacenamiento en Android 9 o inferior (API <= 28)
                val permissionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.RequestMultiplePermissions()
                ) { permissions ->
                    val writeGranted = permissions[Manifest.permission.WRITE_EXTERNAL_STORAGE] ?: false
                    if (!writeGranted && Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                        Toast.makeText(
                            this,
                            "Permiso de almacenamiento requerido para probar la copia en SD",
                            Toast.LENGTH_LONG
                        ).show()
                    }
                }

                LaunchedEffect(Unit) {
                    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                        val hasWrite = ContextCompat.checkSelfPermission(
                            this@MainActivity,
                            Manifest.permission.WRITE_EXTERNAL_STORAGE
                        ) == PackageManager.PERMISSION_GRANTED

                        if (!hasWrite) {
                            permissionLauncher.launch(
                                arrayOf(
                                    Manifest.permission.WRITE_EXTERNAL_STORAGE,
                                    Manifest.permission.READ_EXTERNAL_STORAGE
                                )
                            )
                        }
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    SecureNotesScreen(
                        storageManager = storageManager,
                        onShowToast = { message ->
                            Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
                        }
                    )
                }
            }
        }
    }
}
`,
  },
  {
    name: 'SecureNotesScreen.kt',
    path: 'app/src/main/java/com/security/securenotes/ui/screens/SecureNotesScreen.kt',
    language: 'kotlin',
    category: 'compose_ui',
    description: 'Pantalla principal @Composable: Scaffold, OutlinedTextFields, ExposedDropdownMenuBox y Cards Material 3',
    content: `package com.security.securenotes.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.security.securenotes.SecurityStorageManager
import java.util.UUID

// Categorías disponibles para clasificar secretos
val SECRET_CATEGORIES = listOf(
    "Bancario & Financiero (PINs, Tarjetas)",
    "Credenciales de Acceso (Usuario & Clave)",
    "API Keys & Tokens (AWS, Firebase)",
    "Cripto & Billeteras (Seed Phrases)",
    "Respaldo 2FA (Códigos de recuperación)",
    "Identidad & Documentos (Cédula, Pasaporte)",
    "Médico & Salud Privada (Historial)",
    "Corporativo & Negocios (Contratos)",
    "Redes & Wi-Fi (WPA3, VPN)",
    "Personal & Privado (Notas íntimas)"
)

data class UiNoteItem(
    val id: String,
    val title: String,
    val content: String,
    val category: String,
    val timestamp: String,
    val isEncrypted: Boolean
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecureNotesScreen(
    storageManager: SecurityStorageManager,
    onShowToast: (String) -> Unit
) {
    var title by rememberSaveable { mutableStateOf("") }
    var content by rememberSaveable { mutableStateOf("") }
    var selectedCategory by rememberSaveable { mutableStateOf(SECRET_CATEGORIES[0]) }
    var isDropdownExpanded by remember { mutableStateOf(false) }

    var titleError by rememberSaveable { mutableStateOf<String?>(null) }
    var contentError by rememberSaveable { mutableStateOf<String?>(null) }

    // Estado reactivo de notas
    var encryptedNotesList by remember { mutableStateOf(listOf<UiNoteItem>()) }
    var externalRawText by remember { mutableStateOf<String?>(null) }
    var selectedFilterTab by rememberSaveable { mutableIntStateOf(0) } // 0: Todas, 1: Cifradas, 2: SD

    // Nota seleccionada para ver en detalle
    var selectedNoteForDialog by remember { mutableStateOf<UiNoteItem?>(null) }
    var isSecretRevealedInDialog by remember { mutableStateOf(true) }

    // Función auxiliar para refrescar el estado de persistencia
    fun refreshData() {
        val map = storageManager.getAllEncryptedNotes()
        encryptedNotesList = map.map { (key, rawValue) ->
            val parts = rawValue.split("|||")
            UiNoteItem(
                id = key,
                title = parts.getOrNull(0) ?: key,
                content = parts.getOrNull(1) ?: "",
                category = parts.getOrNull(2) ?: "General",
                timestamp = parts.getOrNull(3) ?: "Reciente",
                isEncrypted = true
            )
        }
        externalRawText = storageManager.readInsecureExternalNote()
    }

    LaunchedEffect(Unit) {
        refreshData()
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Shield,
                            contentDescription = "Shield",
                            tint = Color(0xFF42D674)
                        )
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "SecureNotes Compose",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Text(
                                text = "Punto 4: Cifrado vs SD Externa",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF94A3B8)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color(0xFF111827)
                )
            )
        },
        containerColor = Color(0xFF0B0F19)
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(4.dp)) }

            // =================================================================
            // TARJETA DE ENTRADA: JETPACK COMPOSE MATERIAL 3 CARD
            // =================================================================
            item {
                ElevatedCard(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.elevatedCardColors(
                        containerColor = Color(0xFF111827)
                    ),
                    elevation = CardDefaults.elevatedCardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Nueva Nota Confidencial",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE2E8F0)
                        )

                        // OutlinedTextField para el Título
                        OutlinedTextField(
                            value = title,
                            onValueChange = {
                                title = it
                                if (titleError != null) titleError = null
                            },
                            label = { Text("Título de la Nota") },
                            placeholder = { Text("Ej: Contraseña Bancaria Principal") },
                            isError = titleError != null,
                            supportingText = {
                                if (titleError != null) {
                                    Text(text = titleError!!, color = MaterialTheme.colorScheme.error)
                                }
                            },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            leadingIcon = {
                                Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF42D674))
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF42D674),
                                unfocusedBorderColor = Color(0xFF334155),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            )
                        )

                        // ExposedDropdownMenuBox para la Categoría
                        ExposedDropdownMenuBox(
                            expanded = isDropdownExpanded,
                            onExpandedChange = { isDropdownExpanded = !isDropdownExpanded }
                        ) {
                            OutlinedTextField(
                                value = selectedCategory,
                                onValueChange = {},
                                readOnly = true,
                                label = { Text("Categoría del Secreto") },
                                trailingIcon = {
                                    ExposedDropdownMenuDefaults.TrailingIcon(expanded = isDropdownExpanded)
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .menuAnchor(),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color(0xFF42D674),
                                    unfocusedBorderColor = Color(0xFF334155),
                                    focusedTextColor = Color.White,
                                    unfocusedTextColor = Color.White
                                )
                            )
                            ExposedDropdownMenu(
                                expanded = isDropdownExpanded,
                                onDismissRequest = { isDropdownExpanded = false },
                                modifier = Modifier.background(Color(0xFF1E293B))
                            ) {
                                SECRET_CATEGORIES.forEach { cat ->
                                    DropdownMenuItem(
                                        text = { Text(cat, color = Color.White, fontSize = 13.sp) },
                                        onClick = {
                                            selectedCategory = cat
                                            isDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }

                        // OutlinedTextField para el Contenido Secreto
                        OutlinedTextField(
                            value = content,
                            onValueChange = {
                                content = it
                                if (contentError != null) contentError = null
                            },
                            label = { Text("Contenido Sensible") },
                            placeholder = { Text("Escribe aquí contraseñas, PINs o API tokens...") },
                            isError = contentError != null,
                            supportingText = {
                                if (contentError != null) {
                                    Text(text = contentError!!, color = MaterialTheme.colorScheme.error)
                                }
                            },
                            minLines = 3,
                            maxLines = 5,
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF42D674),
                                unfocusedBorderColor = Color(0xFF334155),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            )
                        )

                        // Botones de Guardado Dual (Punto 4.1 y Punto 4.2)
                        Button(
                            onClick = {
                                val t = title.trim()
                                val c = content.trim()
                                if (t.isEmpty()) {
                                    titleError = "El título es obligatorio"
                                    return@Button
                                }
                                if (c.isEmpty()) {
                                    contentError = "El contenido no puede estar vacío"
                                    return@Button
                                }
                                val id = "note_\${System.currentTimeMillis()}_\${UUID.randomUUID().toString().take(4)}"
                                val success = storageManager.saveEncryptedNote(id, t, c, selectedCategory)
                                if (success) {
                                    onShowToast(" Guardada bajo AES-256 en EncryptedSharedPreferences")
                                    title = ""
                                    content = ""
                                    refreshData()
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF42D674),
                                contentColor = Color(0xFF062617)
                            )
                        ) {
                            Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "1. Guardar Cifrado (Interno Keystore - SEGURO)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }

                        Button(
                            onClick = {
                                val t = title.trim()
                                val c = content.trim()
                                if (t.isEmpty()) {
                                    titleError = "El título es obligatorio"
                                    return@Button
                                }
                                if (c.isEmpty()) {
                                    contentError = "El contenido no puede estar vacío"
                                    return@Button
                                }
                                val file = storageManager.saveInsecureExternalNote(t, c, selectedCategory)
                                if (file != null) {
                                    onShowToast(" Guardada copia en TEXTO PLANO en SD: \${file.name}")
                                    title = ""
                                    content = ""
                                    refreshData()
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFFF59E0B),
                                contentColor = Color(0xFF291400)
                            )
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "2. Guardar Copia en SD (Texto Plano - INSEGURO)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }
                }
            }

            // =================================================================
            // FILTROS SEGMENTADOS EN JETPACK COMPOSE (FILTER CHIPS)
            // =================================================================
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = selectedFilterTab == 0,
                        onClick = { selectedFilterTab = 0 },
                        label = { Text("Todas (\${encryptedNotesList.size})") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFF42D674),
                            selectedLabelColor = Color(0xFF062617)
                        )
                    )
                    FilterChip(
                        selected = selectedFilterTab == 1,
                        onClick = { selectedFilterTab = 1 },
                        leadingIcon = {
                            Icon(Icons.Default.Lock, contentDescription = null, modifier = Modifier.size(14.dp))
                        },
                        label = { Text("Cifradas (\${encryptedNotesList.size})") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFF42D674),
                            selectedLabelColor = Color(0xFF062617)
                        )
                    )
                    FilterChip(
                        selected = selectedFilterTab == 2,
                        onClick = { selectedFilterTab = 2 },
                        leadingIcon = {
                            Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(14.dp))
                        },
                        label = { Text("SD Inseguro") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(0xFFF59E0B),
                            selectedLabelColor = Color(0xFF291400)
                        )
                    )
                }
            }

            // =================================================================
            // LISTA DE NOTAS CIFRADAS
            // =================================================================
            if (selectedFilterTab == 0 || selectedFilterTab == 1) {
                if (encryptedNotesList.isEmpty()) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF111827)),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(
                                    Icons.Default.Shield,
                                    contentDescription = null,
                                    tint = Color(0xFF42D674),
                                    modifier = Modifier.size(36.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    "No hay notas cifradas registradas",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Text(
                                    "Crea una nota con el botón verde para probar EncryptedSharedPreferences.",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                } else {
                    items(encryptedNotesList, key = { it.id }) { note ->
                        ElevatedCard(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF111827))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = note.title,
                                        style = MaterialTheme.typography.titleMedium,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Row(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Surface(
                                            color = Color(0xFF153422),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text(
                                                text = " AES-256",
                                                color = Color(0xFF42D674),
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                        Text(
                                            text = note.category.split("&")[0].trim(),
                                            color = Color(0xFF94A3B8),
                                            fontSize = 11.sp
                                        )
                                    }
                                }

                                Row {
                                    IconButton(onClick = {
                                        selectedNoteForDialog = note
                                        isSecretRevealedInDialog = true
                                    }) {
                                        Icon(Icons.Default.Visibility, contentDescription = "Ver", tint = Color(0xFF42D674))
                                    }
                                    IconButton(onClick = {
                                        storageManager.deleteEncryptedNote(note.id)
                                        refreshData()
                                        onShowToast("Nota eliminada de SharedPreferences")
                                    }) {
                                        Icon(Icons.Default.Delete, contentDescription = "Borrar", tint = Color(0xFFEF4444))
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // =================================================================
            // VISTA PREVIA DEL ALMACENAMIENTO EXTERNO (SD)
            // =================================================================
            if (selectedFilterTab == 0 || selectedFilterTab == 2) {
                item {
                    ElevatedCard(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF301503)),
                        elevation = CardDefaults.elevatedCardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.Warning, contentDescription = null, tint = Color(0xFFF59E0B))
                                Column {
                                    Text(
                                        text = "Almacenamiento Externo / SD (Público Inseguro)",
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFFDE68A),
                                        fontSize = 13.sp
                                    )
                                    Text(
                                        text = "/sdcard/Download/secret_note_insecure.txt",
                                        fontFamily = FontFamily.Monospace,
                                        color = Color(0xFFFBBF24),
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            Surface(
                                modifier = Modifier.fillMaxWidth(),
                                color = Color(0xFF1E0F04),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text(
                                    text = externalRawText ?: "(No hay archivo en SD o fue borrado)",
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 11.sp,
                                    color = if (externalRawText != null) Color(0xFFFCA5A5) else Color(0xFF9CA3AF),
                                    modifier = Modifier.padding(12.dp)
                                )
                            }

                            if (externalRawText != null) {
                                OutlinedButton(
                                    onClick = {
                                        storageManager.clearInsecureExternalFile()
                                        refreshData()
                                        onShowToast("Archivo externo en SD eliminado")
                                    },
                                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFFBBF24))
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Limpiar archivo en SD")
                                }
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }

    // Dialog Compose para ver el detalle de la nota
    if (selectedNoteForDialog != null) {
        val note = selectedNoteForDialog!!
        AlertDialog(
            onDismissRequest = { selectedNoteForDialog = null },
            confirmButton = {
                TextButton(onClick = { selectedNoteForDialog = null }) {
                    Text("Cerrar", color = Color(0xFF42D674))
                }
            },
            title = {
                Text(text = note.title, fontWeight = FontWeight.Bold, color = Color.White)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Categoría: \${note.category}",
                        fontSize = 12.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        color = Color(0xFF0B0F19),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = "Contenido en memoria (RAM):",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF42D674)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = if (isSecretRevealedInDialog) note.content else "••••••••••••••••",
                                fontFamily = FontFamily.Monospace,
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }

                    Text(
                        text = "En disco: Cifrado con AES-256 GCM + SIV. La llave reside en el Keystore de hardware.",
                        fontSize = 11.sp,
                        color = Color(0xFF6EE7B7)
                    )
                }
            },
            containerColor = Color(0xFF1E293B)
        )
    }
}
`,
  },
  {
    name: 'SecurityStorageManager.kt',
    path: 'app/src/main/java/com/security/securenotes/SecurityStorageManager.kt',
    language: 'kotlin',
    category: 'logic',
    description: 'Gestor criptográfico: EncryptedSharedPreferences (AES256 Tink) + Android Keystore y escritura en SD',
    content: `package com.security.securenotes

import android.content.Context
import android.content.SharedPreferences
import android.os.Environment
import android.util.Log
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.io.BufferedReader
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStreamReader

/**
 * Punto 4: Seguridad en el Almacenamiento y Cifrado en Android
 *
 * Esta clase compara dos mecanismos de persistencia local:
 * 1. Almacenamiento Interno Privado Cifrado con EncryptedSharedPreferences (Jetpack Security)
 * 2. Almacenamiento Externo Público Sin Cifrar (/sdcard / Environment.DIRECTORY_DOWNLOADS)
 */
class SecurityStorageManager(private val context: Context) {

    companion object {
        private const val TAG = "SecurityStorageManager"
        private const val ENCRYPTED_PREFS_FILENAME = "secret_notes_encrypted"
        private const val EXTERNAL_INSECURE_FILENAME = "secret_note_insecure.txt"
    }

    // Instancia de SharedPreferences Cifradas respaldada por Android Keystore (Hardware TEE / StrongBox)
    private val encryptedPrefs: SharedPreferences by lazy {
        // 1. Generación/recuperación de la MasterKey en el hardware seguro
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        // 2. Creación de EncryptedSharedPreferences (Google Tink)
        // - Claves cifradas con AES-256 SIV (Determinístico para búsqueda eficiente)
        // - Valores cifrados con AES-256 GCM (Autenticado con IV y Tag de integridad)
        EncryptedSharedPreferences.create(
            context,
            ENCRYPTED_PREFS_FILENAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    // =========================================================================
    // 1. ALMACENAMIENTO INTERNO PRIVADO CIFRADO (SEGURO - JETPACK SECURITY)
    // =========================================================================

    fun saveEncryptedNote(
        noteId: String,
        title: String,
        content: String,
        category: String = "Bancario"
    ): Boolean {
        return try {
            val timestamp = java.text.SimpleDateFormat("HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())
            val payload = "$title|||$content|||$category|||$timestamp"
            encryptedPrefs.edit().putString(noteId, payload).apply()
            Log.d(TAG, "Nota cifrada exitosamente con ID: $noteId en $ENCRYPTED_PREFS_FILENAME.xml")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error al guardar nota cifrada", e)
            false
        }
    }

    fun getEncryptedNote(noteId: String): Triple<String, String, String>? {
        val payload = encryptedPrefs.getString(noteId, null) ?: return null
        val parts = payload.split("|||")
        return if (parts.size >= 2) {
            Triple(parts[0], parts[1], parts.getOrNull(2) ?: "General")
        } else null
    }

    fun getAllEncryptedNotes(): Map<String, String> {
        val all = encryptedPrefs.all
        val result = mutableMapOf<String, String>()
        for ((key, value) in all) {
            if (value is String) {
                result[key] = value
            }
        }
        return result
    }

    fun deleteEncryptedNote(noteId: String) {
        encryptedPrefs.edit().remove(noteId).apply()
    }

    // =========================================================================
    // 2. ALMACENAMIENTO EXTERNO PÚBLICO SIN CIFRAR (INSEGURO - SD / PÚBLICO)
    // =========================================================================

    /**
     * Guarda una copia idéntica en texto plano en el directorio público de descargas.
     * Cualquier aplicación con permisos de lectura o acceso ADB puede extraerla sin root.
     */
    fun saveInsecureExternalNote(title: String, content: String, category: String = "Bancario"): File? {
        return try {
            val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            if (!externalDir.exists()) {
                externalDir.mkdirs()
            }
            val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
            val textToWrite = """
                =====================================================
                NOTA CONFIDENCIAL - COPIA SIN CIFRAR EN SD/EXTERNO
                Fecha: \${java.util.Date()}
                Categoría: $category
                Título: $title
                Contenido Confidencial:
                $content
                =====================================================
            """.trimIndent()

            FileOutputStream(targetFile, true).use { fos ->
                fos.write((textToWrite + "\\n\\n").toByteArray())
            }
            Log.w(TAG, "ADVERTENCIA: Nota guardada en texto plano en: \${targetFile.absolutePath}")
            targetFile
        } catch (e: Exception) {
            Log.e(TAG, "Error guardando en almacenamiento externo", e)
            null
        }
    }

    fun readInsecureExternalNote(): String? {
        val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
        if (!targetFile.exists()) return null

        val sb = StringBuilder()
        BufferedReader(InputStreamReader(FileInputStream(targetFile))).use { reader ->
            var line: String? = reader.readLine()
            while (line != null) {
                sb.append(line).append("\\n")
                line = reader.readLine()
            }
        }
        return sb.toString()
    }

    fun clearInsecureExternalFile(): Boolean {
        val externalDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        val targetFile = File(externalDir, EXTERNAL_INSECURE_FILENAME)
        return if (targetFile.exists()) targetFile.delete() else true
    }
}
`,
  },
  {
    name: 'Theme.kt',
    path: 'app/src/main/java/com/security/securenotes/ui/theme/Theme.kt',
    language: 'kotlin',
    category: 'compose_ui',
    description: 'Configuración del Tema Material 3 para Jetpack Compose con paleta de seguridad esmeralda/ciber',
    content: `package com.security.securenotes.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = SecurityGreen,
    onPrimary = DarkBackground,
    primaryContainer = SecurityGreenContainer,
    onPrimaryContainer = SecurityGreenLight,
    secondary = AmberAlert,
    onSecondary = DarkBackground,
    background = DarkBackground,
    surface = CardSurfaceDark,
    onBackground = TextWhite,
    onSurface = TextWhite,
    error = RedAlert
)

@Composable
fun SecureNotesTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        else -> DarkColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = DarkBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
`,
  },
  {
    name: 'Color.kt',
    path: 'app/src/main/java/com/security/securenotes/ui/theme/Color.kt',
    language: 'kotlin',
    category: 'compose_ui',
    description: 'Paleta de colores oficial en Jetpack Compose para estados seguros y de alerta',
    content: `package com.security.securenotes.ui.theme

import androidx.compose.ui.graphics.Color

val SecurityGreen = Color(0xFF42D674)
val SecurityGreenLight = Color(0xFF80EF80)
val SecurityGreenContainer = Color(0xFF153422)
val AmberAlert = Color(0xFFF59E0B)
val RedAlert = Color(0xFFEF4444)
val DarkBackground = Color(0xFF0B0F19)
val CardSurfaceDark = Color(0xFF111827)
val TextWhite = Color(0xFFF8FAFC)
val TextMuted = Color(0xFF94A3B8)
`,
  },
  {
    name: 'Type.kt',
    path: 'app/src/main/java/com/security/securenotes/ui/theme/Type.kt',
    language: 'kotlin',
    category: 'compose_ui',
    description: 'Tipografía Material 3 para Jetpack Compose',
    content: `package com.security.securenotes.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 24.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Monospace,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp
    )
)
`,
  },
  {
    name: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Gradle Kotlin DSL con buildFeatures { compose = true } y dependencias Compose BOM + Jetpack Security',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.security.securenotes"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.security.securenotes"
        minSdk = 23 // Jetpack Security requiere minSdk 23 por Keystore de hardware
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }

    kotlinOptions {
        jvmTarget = "1.8"
    }

    // =========================================================================
    // HABILITACIÓN DE JETPACK COMPOSE
    // =========================================================================
    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // AndroidX Core & Activity Compose
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)

    // Jetpack Compose BOM & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // =========================================================================
    // BIBLIOTECA CLAVE DEL PUNTO 4: JETPACK SECURITY (EncryptedSharedPreferences)
    // =========================================================================
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Debugging Tooling
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
`,
  },
  {
    name: 'libs.versions.toml',
    path: 'gradle/libs.versions.toml',
    language: 'toml',
    category: 'gradle',
    description: 'Catálogo de versiones moderno (Version Catalog) de Gradle para Jetpack Compose y Security',
    content: `[versions]
agp = "8.3.0"
kotlin = "1.9.22"
coreKtx = "1.12.0"
lifecycleRuntimeKtx = "2.7.0"
activityCompose = "1.8.2"
composeBom = "2024.02.00"
securityCrypto = "1.1.0-alpha06"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-security-crypto = { group = "androidx.security", name = "security-crypto", version.ref = "securityCrypto" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`,
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Manifiesto Android con permisos para probar almacenamiento externo y tema Compose',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.security.securenotes">

    <!-- Permisos para almacenamiento externo (necesarios para demostrar la copia insegura en SD) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28"
        tools:ignore="ScopedStorage" />

    <application
        android:allowBackup="false"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="false"
        android:icon="@mipmap/ic_launcher"
        android:label="SecureNotes Compose"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SecureNotes"
        android:requestLegacyExternalStorage="true"
        tools:targetApi="31">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.SecureNotes">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`,
  },
  {
    name: 'settings.gradle.kts',
    path: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Configuración de repositorios Google() y MavenCentral() para Android Studio',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "SecureNotesCompose"
include(":app")
`,
  },
  {
    name: 'build.gradle.kts (Raíz)',
    path: 'build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Build file raíz del proyecto para Android Studio',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`,
  },
];
