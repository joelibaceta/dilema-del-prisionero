# Dilema del Prisionero Iterado - Aplicación para Dinámicas de Grupo

Una aplicación educativa para explorar la teoría de juegos a través del clásico Dilema del Prisionero, diseñada para talleres y dinámicas de grupo.

**Cualidades de la Experiencia**:
1. **Educativa**: Transmite conceptos de cooperación y competencia de forma intuitiva
2. **Accesible**: Interfaz clara en español, sin jerga técnica, proyectable en talleres
3. **Interactiva**: Permite experimentar con diferentes estrategias y ver resultados inmediatos

**Nivel de Complejidad**: Light Application (múltiples características con estado básico)
- Aplicación de simulación educativa con varios modos de juego
- Estado temporal en memoria sin persistencia
- Interfaz interactiva para experimentación en tiempo real

## Características Esenciales

**Configuración de Partida**
- Funcionalidad: Establecer parámetros del juego (modo, estrategias, rondas, matriz de pagos)
- Propósito: Permitir explorar diferentes escenarios y configuraciones
- Activación: Panel inicial de configuración
- Flujo: Seleccionar modo → Configurar estrategias → Ajustar parámetros → Iniciar
- Criterio de éxito: Todas las configuraciones se aplican correctamente al juego

**Modos de Juego**
- Funcionalidad: Humano vs Bot, Bot vs Bot, Humano vs Humano (pass-and-play)
- Propósito: Explorar dinámicas de cooperación en diferentes contextos
- Activación: Selección en panel de configuración
- Flujo: Elegir modo → Configurar jugadores → Jugar rondas → Ver resultados
- Criterio de éxito: Cada modo funciona según sus reglas específicas

**Sistema de Estrategias de Bot**
- Funcionalidad: 5 estrategias (Always Cooperate, Always Defect, Tit for Tat, Grim Trigger, Random)
- Propósito: Demostrar diferentes enfoques de cooperación/competencia
- Activación: Selección de estrategia para jugadores bot
- Flujo: Elegir estrategia → Configurar parámetros → Observar comportamiento
- Criterio de éxito: Cada estrategia se comporta según su definición teórica

**Simultaneidad de Decisiones**
- Funcionalidad: Decisiones ocultas hasta que ambos jugadores confirmen
- Propósito: Simular la toma de decisiones real del dilema
- Activación: Al hacer una elección en modo humano
- Flujo: Elegir acción → Confirmar → Esperar al otro → Revelar simultáneamente
- Criterio de éxito: No se puede ver la decisión del oponente antes de confirmar

**Análisis y Reflexión Automática**
- Funcionalidad: Generación de feedback educativo al final de la partida
- Propósito: Facilitar la reflexión sobre estrategias y resultados
- Activación: Al completar todas las rondas
- Flujo: Terminar juego → Calcular métricas → Generar análisis → Mostrar reflexión
- Criterio de éxito: El análisis es claro, educativo y relevante a los resultados

## Manejo de Casos Extremos
- **Configuración inválida**: Validación de inputs con mensajes claros
- **Empate en puntos**: Mostrar resultado de empate sin declarar ganador
- **Recarga de página**: Pérdida completa de datos (por diseño)
- **Juego muy largo**: Tabla de historial con scroll
- **Velocidad de auto-play**: Control deslizable para ajustar timing

## Dirección de Diseño
La interfaz debe sentirse educativa y profesional, apropiada para proyección en talleres. Diseño limpio y minimalista que no distraiga del contenido educativo, con elementos visuales claros que faciliten la comprensión de conceptos de teoría de juegos.

## Selección de Colores
Esquema Triadic con énfasis en claridad educativa:
- **Color Primario**: Azul académico (oklch(0.5 0.15 240)) - transmite confianza y profesionalismo
- **Colores Secundarios**: Verde cooperación (oklch(0.6 0.15 150)) y Rojo competencia (oklch(0.55 0.15 15))
- **Color de Acento**: Amarillo destacado (oklch(0.75 0.12 85)) - para llamadas a la acción importantes
- **Pares Foreground/Background**:
  - Background blanco (oklch(0.98 0 0)): Texto gris oscuro (oklch(0.2 0 0)) - Ratio 15.8:1 ✓
  - Primario azul: Texto blanco (oklch(0.98 0 0)) - Ratio 7.2:1 ✓
  - Verde cooperación: Texto blanco (oklch(0.98 0 0)) - Ratio 6.8:1 ✓
  - Rojo competencia: Texto blanco (oklch(0.98 0 0)) - Ratio 6.5:1 ✓

## Selección de Fuente
Tipografía clara y legible para presentaciones, utilizando Inter por su excelente legibilidad en pantallas y proyectores.

**Jerarquía Tipográfica**:
- H1 (Título principal): Inter Bold/32px/tight letter spacing
- H2 (Títulos de sección): Inter SemiBold/24px/normal spacing
- H3 (Subtítulos): Inter Medium/18px/normal spacing
- Body (Texto principal): Inter Regular/16px/relaxed line height
- Small (Texto secundario): Inter Regular/14px/normal spacing

## Animaciones
Animaciones sutiles que refuercen el flujo educativo sin distraer. Transiciones suaves para revelar resultados y cambios de estado que ayuden a seguir la lógica del juego.

**Significado Intencional**: Las animaciones comunican el flujo temporal del juego y los momentos de revelación
**Jerarquía de Movimiento**: Revelar resultados > Transiciones de estado > Hover feedback

## Selección de Componentes
**Componentes shadcn**:
- Button: Para acciones principales (confirmar, siguiente ronda)
- Card: Para paneles de jugadores y configuración
- Table: Para historial de rondas
- Tabs: Para diferentes secciones de configuración
- Slider: Para velocidad de auto-play y probabilidad random
- Select: Para elección de estrategias y modos
- Input: Para parámetros numéricos

**Customizaciones**: Botones de acción específicos con iconos de cooperar/traicionar
**Estados**: Énfasis en estados pendientes, confirmados y revelados
**Iconos Phosphor**: Handshake para cooperar, Lightning para traicionar, Play/Pause para controles
**Espaciado**: Grid 8px base, gaps generosos para claridad visual
**Mobile**: Diseño responsive con paneles apilables en pantallas pequeñas