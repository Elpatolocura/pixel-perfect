# Guía para Generar el APK de Eventia

He configurado **Capacitor** en tu proyecto, lo que permite convertir tu aplicación web en una aplicación nativa de Android.

## Estado Actual
1.  **Capacitor instalado**: Se han añadido las dependencias necesarias.
2.  **Proyecto inicializado**: El ID de la app es `com.eventia.app`.
3.  **Plataforma Android añadida**: Existe una carpeta `android/` con el código nativo.
4.  **Sincronización completada**: Los archivos de la web (`dist/`) ya están dentro del proyecto Android.

## Requisitos Previos
Para generar el archivo `.apk`, necesitas tener instalados en tu computadora:
1.  **Android Studio**: [Descargar aquí](https://developer.android.com/studio)
2.  **Java JDK (versión 17 o superior)**.

## Pasos para generar el APK

### Opción A: Usando Android Studio (Recomendado)
1.  Abre **Android Studio**.
2.  Selecciona **"Open an existing project"**.
3.  Busca y selecciona la carpeta `android` que está dentro de tu proyecto (`c:\Users\ADMIN\OneDrive\Desktop\EVENTIA\pixel-perfect\android`).
4.  Espera a que Android Studio descargue las dependencias (Gradle) y sincronice el proyecto.
5.  En el menú superior, ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6.  Una vez termine, aparecerá un aviso en la esquina inferior derecha con un enlace "locate" para ver tu archivo `app-debug.apk`.

### Opción B: Actualizar cambios de la web
Si haces cambios en el código de React y quieres verlos en la app:
1.  Ejecuta: `npm run build`
2.  Ejecuta: `npx cap sync`
3.  Vuelve a generar el APK en Android Studio.

## Personalización
- **Icono y Splash Screen**: Puedes usar el comando `npx @capacitor/assets generate` (requiere tener imágenes de origen en una carpeta `assets`).
- **Nombre de la App**: Se puede cambiar en `android/app/src/main/res/values/strings.xml`.
