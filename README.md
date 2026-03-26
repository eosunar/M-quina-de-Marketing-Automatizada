# AI-Powered Marketing Campaign Tool

Una plataforma empresarial premium para la gestión, generación y optimización de campañas de marketing utilizando Inteligencia Artificial (Gemini).

## 🚀 Características Principales

- **Dashboard de Rendimiento**: Visualización en tiempo real de presupuesto, alcance y proyectos activos.
- **Generador de Campañas con IA**: Creación de iniciativas completas basadas en objetivos, industria y audiencia.
- **Laboratorio de Copys y Scripts**: Generación de textos persuasivos y guiones para video (Reels/TikTok) optimizados por IA.
- **Estudio Visual**: Generación de imágenes publicitarias mediante IA.
- **Calendario Inteligente**: Planificación visual de campañas con capacidad de auto-generación mensual.
- **Métricas Predictivas**: Estimación de Engagement, CTR y Conversiones antes del lanzamiento.
- **Exportación a Excel**: Descarga todos los datos y métricas de tus campañas en formato `.xlsx`.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS (con efectos de gradientes mesh y botones 3D)
- **Animaciones**: Framer Motion
- **IA**: Google Gemini API (@google/genai)
- **Iconos**: Lucide React
- **Procesamiento de Datos**: Date-fns, XLSX

## 📦 Instalación y Uso

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tu clave de API de Gemini en las variables de entorno:
   ```env
   GEMINI_API_KEY=tu_clave_aqui
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🎨 Diseño
El proyecto cuenta con una interfaz "Enterprise Premium" que utiliza:
- Botones con profundidad 3D.
- Fondos con gradientes dinámicos.
- Elementos flotantes animados para una experiencia de usuario envolvente.
