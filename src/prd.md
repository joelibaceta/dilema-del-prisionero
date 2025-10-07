# PRD: Dilema del Prisionero Iterado

## Core Purpose & Success
- **Mission Statement**: Simular y enseñar el dilema del prisionero iterado de forma interactiva para estudiantes de teoría de juegos.
- **Success Indicators**: Los usuarios comprenden las diferentes estrategias, pueden experimentar con parámetros y observar resultados a largo plazo.
- **Experience Qualities**: Educativo, Intuitivo, Científico

## Project Classification & Approach
- **Complexity Level**: Light Application (múltiples características con estado básico)
- **Primary User Activity**: Interacting (experimentando con estrategias y parámetros)

## Essential Features

### Configuración Simplificada
- **Funcionalidad**: Interfaz principal simple con modos de juego básicos y configuración avanzada desplegable
- **Propósito**: Reducir la complejidad inicial para nuevos usuarios mientras mantiene flexibilidad
- **Criterio de éxito**: Los usuarios pueden iniciar una partida en menos de 30 segundos

### Simulación de Estrategias
- **Funcionalidad**: Estrategia "Random" por defecto para demostrar variabilidad
- **Propósito**: Mostrar la importancia de la incertidumbre en la teoría de juegos
- **Criterio de éxito**: Los resultados varían entre partidas y reflejan las probabilidades configuradas

### Análisis Visual de Resultados
- **Funcionalidad**: Gráficos y estadísticas en tiempo real de las partidas
- **Propósito**: Permitir análisis inmediato de patrones y tendencias
- **Criterio de éxito**: Los usuarios pueden identificar visualmente qué estrategias funcionan mejor

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Confianza académica, curiosidad científica, claridad educativa
- **Design Personality**: Profesional pero accesible, estilo educativo moderno
- **Visual Metaphors**: Colores que representan cooperación (verde) vs competencia (rojo)
- **Simplicity Spectrum**: Interfaz limpia con complejidad progresiva a través de desplegables

### Color Strategy
- **Color Scheme Type**: Triadic educativo con colores específicos para acciones del juego
- **Primary Color**: Azul académico (oklch(0.5 0.15 240)) - transmite confianza y profesionalismo
- **Secondary Colors**: Azul muy claro para elementos de apoyo
- **Accent Color**: Amarillo destacado para elementos importantes
- **Colores del Juego**: Verde cooperación, Rojo competencia
- **Color Psychology**: Azul promueve concentración, verde/rojo son universalmente reconocidos para cooperar/competir

### Typography System
- **Font Pairing Strategy**: Inter como fuente única para máxima legibilidad
- **Typographic Hierarchy**: Clara diferenciación entre títulos, subtítulos y texto
- **Font Personality**: Moderna, técnica pero amigable
- **Which fonts**: Inter (400, 500, 600, 700)

### UI Elements & Component Selection
- **Component Usage**: 
  - Collapsible para configuración avanzada
  - Select con descripciones para estrategias
  - Slider para probabilidades
  - Cards para organización visual
- **Component Hierarchy**: Tabs principales > Configuración básica > Configuración avanzada desplegable
- **Mobile Adaptation**: Grid responsivo que se adapta a pantallas pequeñas

### Animations
- **Purposeful Meaning**: Transiciones suaves en desplegables para guiar la atención
- **Hierarchy of Movement**: Elementos de configuración se revelan progresivamente
- **Contextual Appropriateness**: Movimiento sutil que no distrae del contenido educativo

## Implementation Considerations

### Onboarding Simplificado
- Configuración básica visible por defecto
- Estrategia "Random" como predeterminada para mostrar variabilidad
- Configuración avanzada desplegable para usuarios expertos

### Escalabilidad Educativa
- Estructura preparada para agregar más estrategias
- Parámetros configurables para diferentes niveles de complejidad
- Interfaz que se adapta a diferentes contextos educativos

## Reflection
Esta implementación equilibra la simplicidad para principiantes con la profundidad necesaria para estudiantes avanzados. La configuración por defecto de estrategia aleatoria introduce inmediatamente el concepto de incertidumbre, fundamental en teoría de juegos, mientras que la configuración avanzada desplegable mantiene la interfaz limpia pero accesible para experimentación más profunda.