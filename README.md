# PathForge AI 🚀 — Creador de Rutas de Aprendizaje Autodidacta

**PathForge AI** es una plataforma interactiva moderna diseñada para ayudarte a estructurar tu aprendizaje autodidacta. Con el poder de la Inteligencia Artificial (o un mentor simulado local inteligente si trabajas sin conexión), PathForge AI genera etapas, temas y recursos específicos para ayudarte a dominar cualquier habilidad desde cero.

Este proyecto utiliza **`pnpm`** como gestor de paquetes de manera predeterminada para garantizar la máxima seguridad, eficiencia y velocidad en el desarrollo.

---

## 🔒 ¿Por qué pnpm? (Seguridad y Rendimiento)

A diferencia de `npm` o `yarn`, **pnpm** ofrece ventajas críticas de seguridad y eficiencia:
1. **Almacenamiento Global Único (Content-addressable store)**: Evita duplicar dependencias en el disco. Si múltiples proyectos usan la misma versión de una librería, pnpm la descarga una sola vez y crea enlaces duros (hard links).
2. **Seguridad contra dependencias fantasmas (No-flat node_modules)**: pnpm crea un árbol de dependencias estricto y no plano. Un paquete solo puede acceder a las dependencias declaradas explícitamente en su `package.json`, eliminando el riesgo de que tu código dependa accidentalmente de dependencias transitivas (fantasmas) que podrían ser vulnerables o cambiar sin previo aviso.
3. **Instalación ultrarrápida**: Pasa la fase de resolución, descarga y enlace en paralelo, reduciendo los tiempos de instalación hasta en un 70%.

---

## 🛠️ Instalación y Uso Rápido

### Requisitos Previos
Asegúrate de tener instalado [Node.js](https://nodejs.org/) y **pnpm**. Si no tienes pnpm instalado globalmente, puedes instalarlo ejecutando:
```bash
npm install -g pnpm
```

### 1. Clonar e Instalar Dependencias
Instala los módulos del proyecto de forma rápida y segura con pnpm:
```bash
pnpm install
```

### 2. Iniciar el Servidor de Desarrollo
Para correr la aplicación de forma local:
```bash
pnpm dev
```
La aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

---

## ⚡ Acceso Rápido con Windows

Si estás en Windows, puedes iniciar todo con un solo clic:
* Haz doble clic sobre el archivo **`iniciar.bat`** en la carpeta raíz.
* El script instalará automáticamente las dependencias si faltan, levantará el servidor local usando **pnpm** y abrirá tu navegador web por ti.

---

## 🧠 Características Principales

* **Generador de Rutas por IA**: Introduce cualquier tema (ej: *"Python desde cero"* o *"Diseño de Interfaces en Figma"*) y la IA estructurará un plan paso a paso.
* **Smart Fallback Generator**: Si la clave de la IA no está disponible, el sistema cuenta con un generador local inteligente que extrae palabras clave para construir un plan a la medida en segundos.
* **Integración de Clave API Personalizada**: Añade tu clave gratuita de Google AI Studio desde la sección de **Perfil** en la aplicación y valida la conexión al instante.
* **Registro rápido (Modo Demo)**: Explora la app de forma inmediata con el botón "Acceso Rápido (Demo)" de la pantalla de inicio de sesión.
