import React, { useState } from 'react';
import {
  Code2,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Cpu,
  RefreshCw,
  Eye,
  FileCode,
  Shield,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

export const ComposeInspector: React.FC<{
  onNavigateToCode?: () => void;
  onNavigateToPhone?: () => void;
}> = ({ onNavigateToCode, onNavigateToPhone }) => {
  const [selectedNode, setSelectedNode] = useState<string>('form_card');

  const COMPOSE_TREE = [
    {
      id: 'theme',
      name: 'SecureNotesTheme',
      category: 'Theme / Styling',
      code: `SecureNotesTheme {
    Surface(color = MaterialTheme.colorScheme.background) {
        SecureNotesScreen(storageManager, onShowToast)
    }
}`,
      desc: 'Define el esquema de color oscuro Material 3 con verde esmeralda y soporte dinámico de color en Android 12+.',
      advantages: [
        'Sustituye themes.xml y colors.xml tradicionales',
        'Consistencia de tokens Material 3 en tiempo de compilación',
        'Soporte nativo para modo oscuro y Dynamic Color',
      ],
    },
    {
      id: 'scaffold',
      name: 'Scaffold & TopAppBar',
      category: 'Layout Container',
      code: `Scaffold(
    topBar = {
        CenterAlignedTopAppBar(
            title = { Text("SecureNotes Compose") }
        )
    }
) { innerPadding ->
    LazyColumn(modifier = Modifier.padding(innerPadding)) { ... }
}`,
      desc: 'Estructura visual estándar de Material Design con soporte automático para WindowInsets e islas dinámicas.',
      advantages: [
        'Manejo automático del padding seguro (status bar / navigation bar)',
        'Sin necesidad de CoordinatorLayout ni CoordinatorLayout.Behavior en XML',
      ],
    },
    {
      id: 'form_card',
      name: 'ElevatedCard (Formulario de Entrada)',
      category: 'Input Component',
      code: `ElevatedCard(
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.elevatedCardColors(containerColor = Color(0xFF111827))
) {
    Column(modifier = Modifier.padding(16.dp)) {
        OutlinedTextField(value = title, onValueChange = { title = it })
        ExposedDropdownMenuBox(...)
        OutlinedTextField(value = content, onValueChange = { content = it })
        Button(...) { ... }
    }
}`,
      desc: 'Tarjeta contenedora del formulario con elevación tonal y validación de estado reactiva en tiempo real.',
      advantages: [
        'Sustituye LinearLayout anidado dentro de CardView de XML',
        'Menor costo de medición y renderizado en el pipeline de Compose',
      ],
    },
    {
      id: 'text_field',
      name: 'OutlinedTextField & State Hoisting',
      category: 'Input & Validation',
      code: `var title by rememberSaveable { mutableStateOf("") }
var titleError by rememberSaveable { mutableStateOf<String?>(null) }

OutlinedTextField(
    value = title,
    onValueChange = { 
        title = it
        if (titleError != null) titleError = null 
    },
    label = { Text("Título de la Nota") },
    isError = titleError != null,
    supportingText = { if (titleError != null) Text(titleError!!) }
)`,
      desc: 'Campo de texto declarativo con retención de estado ante rotación de pantalla mediante rememberSaveable.',
      advantages: [
        'Elimina TextWatcher e idênticas asignaciones findViewById()',
        'El estado es la única fuente de verdad (Single Source of Truth)',
        'Manejo declarativo de errores e iconos flotantes',
      ],
    },
    {
      id: 'dropdown',
      name: 'ExposedDropdownMenuBox (Categoría)',
      category: 'Selector',
      code: `ExposedDropdownMenuBox(
    expanded = isDropdownExpanded,
    onExpandedChange = { isDropdownExpanded = !isDropdownExpanded }
) {
    OutlinedTextField(
        value = selectedCategory,
        readOnly = true,
        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) }
    )
    ExposedDropdownMenu(...) {
        SECRET_CATEGORIES.forEach { cat -> DropdownMenuItem(...) }
    }
}`,
      desc: 'Menú desplegable estilizado que reemplaza al clásico y rígido Spinner de Android con soporte accesible.',
      advantages: [
        'No requiere ArrayAdapter ni listeners onItemSelectedListener complejos',
        'Estilizado total alineado a la paleta sin temas de popup heredados',
      ],
    },
    {
      id: 'chips',
      name: 'FilterChip Segmented Row',
      category: 'Navigation & Filter',
      code: `Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
    FilterChip(
        selected = filterIndex == 0,
        onClick = { filterIndex = 0 },
        label = { Text("Todas") }
    )
    FilterChip(
        selected = filterIndex == 1,
        onClick = { filterIndex = 1 },
        leadingIcon = { Icon(Icons.Default.Lock) },
        label = { Text("Cifradas (AES-256)") }
    )
}`,
      desc: 'Componentes de filtrado reactivo de notas que disparan recomposición automática instantánea.',
      advantages: [
        'Sin pestañas XML TabLayout pesadas ni ViewPager innecesario',
        'Animación fluida de selección',
      ],
    },
    {
      id: 'lazy_column',
      name: 'LazyColumn (Lista de Notas)',
      category: 'Recycler / Virtual List',
      code: `LazyColumn(verticalArrangement = Arrangement.spacedBy(16.dp)) {
    items(encryptedNotesList, key = { it.id }) { note ->
        ElevatedCard(...) { ... }
    }
}`,
      desc: 'Lista virtualizada eficiente que reemplaza completamente a RecyclerView y sus clases ViewHolder y Adapter.',
      advantages: [
        '0 clases de Adapter, 0 ViewHolders y 0 DiffUtil boilerplates',
        'Clave única key = { it.id } para animaciones automáticas de inserción/borrado',
      ],
    },
  ];

  const currentNode = COMPOSE_TREE.find((n) => n.id === selectedNode) || COMPOSE_TREE[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FAFDF9] border border-[#BADBA2] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-[#153422] border-2 border-[#42D674]/50 flex items-center justify-center text-[#42D674] shadow-xs shrink-0">
              <Code2 className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#42D674] text-xs font-mono font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                Arquitectura Moderna Android: Jetpack Compose (Material 3)
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                Migración de Vistas XML a Jetpack Compose Declarativo
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
                Inspecciona cómo la interfaz del Punto 4 fue reconstruida utilizando funciones{' '}
                <code className="bg-[#E3F0A3] px-1 py-0.5 rounded font-mono font-bold text-gray-900">
                  @Composable
                </code>
                , gestión reactiva de estado (UDF) y componentes oficiales de Material 3.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNavigateToPhone && (
              <button
                type="button"
                onClick={onNavigateToPhone}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#BADBA2] hover:bg-gray-50 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#42D674]" />
                <span>Ver en Simulador</span>
              </button>
            )}
            {onNavigateToCode && (
              <button
                type="button"
                onClick={onNavigateToCode}
                className="px-3.5 py-1.5 rounded-xl bg-[#42D674] hover:bg-[#38b863] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <FileCode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Ver Código Kotlin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Comparison: XML vs Compose */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Traditional XML */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span>Paradigma Anterior: XML Imperativo + ViewBinding</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-bold">
              activity_main.xml
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Requería archivos XML separados, inflado en tiempo de ejecución, sincronización manual de
            estados mutable mediante setters y manejo de adaptadores pesados para listas.
          </p>

          <div className="bg-gray-900 rounded-xl p-3 text-[11px] font-mono text-gray-300 space-y-1">
            <span className="text-gray-500">// En MainActivity.kt con ViewBinding:</span>
            <div className="text-rose-300">val binding = ActivityMainBinding.inflate(layoutInflater)</div>
            <div className="text-gray-400">setContentView(binding.root)</div>
            <div className="text-gray-400">binding.spCategory.adapter = ArrayAdapter(...)</div>
            <div className="text-gray-400">binding.btnSave.setOnClickListener &#123; ... &#125;</div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex items-center gap-2 text-rose-600">
              <span>✕ Múltiples fuentes de verdad (XML + Activity)</span>
            </div>
            <div className="flex items-center gap-2 text-rose-600">
              <span>✕ Pérdida de estado al rotar la pantalla sin parcelables</span>
            </div>
            <div className="flex items-center gap-2 text-rose-600">
              <span>✕ Excesivo código repetitivo (Boilerplate)</span>
            </div>
          </div>
        </div>

        {/* Right: Modern Jetpack Compose */}
        <div className="bg-white border-2 border-[#42D674] rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <span className="w-3 h-3 rounded-full bg-[#42D674]"></span>
              <span>Paradigma Actual: Jetpack Compose Declarativo</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3F0A3] text-gray-900 font-bold">
              100% Kotlin (@Composable)
            </span>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            La interfaz de usuario es una función directa del estado (<code className="bg-[#FAFDF9] text-[#42D674] font-mono font-bold">UI = f(State)</code>). Cuando el estado cambia, Compose recalcula únicamente las partes necesarias mediante recomposición inteligente.
          </p>

          <div className="bg-gray-900 rounded-xl p-3 text-[11px] font-mono text-gray-300 space-y-1">
            <span className="text-gray-500">// En MainActivity.kt con Jetpack Compose:</span>
            <div className="text-[#80EF80]">setContent &#123; SecureNotesTheme &#123;</div>
            <div className="text-white pl-2">SecureNotesScreen(storageManager, onShowToast)</div>
            <div className="text-[#80EF80]">&#125; &#125;</div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-700">
            <div className="flex items-center gap-2 text-[#42D674] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Unidirectional Data Flow (UDF) garantizado</span>
            </div>
            <div className="flex items-center gap-2 text-[#42D674] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Retención de estado con rememberSaveable</span>
            </div>
            <div className="flex items-center gap-2 text-[#42D674] font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Integración perfecta con EncryptedSharedPreferences</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Compose Hierarchy Explorer */}
      <div className="bg-white border-2 border-[#BADBA2] rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-[#FAFDF9] px-5 py-3 border-b border-[#BADBA2]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
            <Layers className="w-4 h-4 text-[#42D674]" />
            <span>Explorador del Árbol de Componentes @Composable</span>
          </div>
          <span className="text-[11px] font-mono text-gray-600 bg-white px-2.5 py-1 rounded-md border border-[#BADBA2]">
            Haz clic en un componente para ver su implementación
          </span>
        </div>

        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Component Tree List */}
          <div className="w-full lg:w-80 p-3 space-y-1.5 bg-[#FAFDF9]">
            {COMPOSE_TREE.map((node) => {
              const isSelected = selectedNode === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNode(node.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer border flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-white border-[#42D674] text-gray-900 shadow-xs ring-1 ring-[#42D674]/50'
                      : 'bg-white/60 border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{node.name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#42D674]' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{node.category}</span>
                </button>
              );
            })}
          </div>

          {/* Component Details & Code */}
          <div className="flex-1 p-6 space-y-4 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#42D674] font-bold block">
                  {currentNode.category}
                </span>
                <h3 className="text-base font-bold text-gray-900">{currentNode.name}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-[#E3F0A3] text-gray-900 text-[10px] font-mono font-bold border border-[#BADBA2]">
                Kotlin Compose Material 3
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">{currentNode.desc}</p>

            {/* Code Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#42D674]" />
                Sintaxis Composable Declarativa:
              </span>
              <pre className="bg-gray-900 text-[#80EF80] p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-gray-800">
                {currentNode.code}
              </pre>
            </div>

            {/* Advantages */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-800">Ventajas en el Laboratorio:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentNode.advantages.map((adv, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#FAFDF9] border border-[#BADBA2] text-xs text-gray-700 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#42D674] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">{adv}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
