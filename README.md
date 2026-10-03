# Portfolio de Habana

Portfolio estático de Cristian Rivero Llácer (Habana / elhabana), centrado en programación y desarrollo de videojuegos. HTML, CSS y JavaScript sin dependencias ni compilación.

## Archivos

- `index.html`: portada con panel C#, herramientas, cuatro proyectos, perfil, formación y selección de cambios públicos.
- `css/styles.css`: diseño oscuro, composición adaptable, animaciones y estilos de accesibilidad.
- `js/main.js`: filtros, navegación activa y ventana de vídeo. Los detalles usan el elemento HTML nativo `details`.
- `assets/projects/`: portadas originales de los proyectos publicadas en The Rookies, guardadas localmente.
- `docs/sources.md`: procedencia del contenido y fecha de revisión.

## Ver la web

Abre `index.html` en un navegador. No necesitas instalar nada.
Para los vídeos incrustados es preferible una vista previa HTTP o GitHub Pages: algunas plataformas restringen la reproducción desde archivos locales. Cada vídeo tiene un enlace alternativo a su plataforma.

## Comprobar cambios

1. Revisa la portada con la ventana amplia y estrecha (320, 390, 768 y 1440 px son tamaños útiles).
2. En Proyectos, prueba Todos, Multijugador y Acción & arcade.
3. Abre los detalles de cada proyecto.
4. Abre un gameplay y ciérralo con el botón o con Escape. El vídeo debe desaparecer y el foco volver a su enlace.
5. Prueba los enlaces de navegación, GitHub y The Rookies.
6. Recorre la web con Tab. La preferencia de reducir movimiento del sistema desactiva las animaciones.

El contenido y los enlaces se conservan sin JavaScript; los filtros solo aparecen cuando el script está activo. Los vídeos externos se cargan únicamente al pulsar su enlace.

## Mantener el contenido

Edita el texto de las tarjetas en `index.html`. Para añadir un proyecto, copia un bloque `article.project-card`, asigna un identificador único, su categoría (`multiplayer` o `arcade`) y sus enlaces. Actualiza el número del filtro Todos y el contador inicial. Guarda su portada en `assets/projects/`.

Los enlaces con `data-video` abren la ventana de vídeo; `href` apunta siempre a la página original como alternativa sin JavaScript.

El devlog es una selección editorial estática, revisada el 3 de octubre de 2026; no se sincroniza automáticamente con GitHub. Al actualizarlo, enlaza el commit correspondiente y cambia la fecha de revisión. No incluyas avances que no se puedan comprobar.

Las descripciones de proyectos en equipo no atribuyen tareas individuales sin confirmación. Un-Credibles solo muestra su nombre, el estado En desarrollo y una descripción breve. No añadir detalles técnicos, enlaces a su código ni entradas de devlog hasta que el propietario lo pida.

## Publicación

Preparado para servir desde la raíz del repositorio en GitHub Pages. Esta actualización solo modifica los archivos locales: no hace commit, push ni cambia la configuración de publicación.


## Dirección visual

Referencia de composición: https://abusaid.netlify.app/. Adaptación propia con negro como base, paneles grafito, acentos menta y violeta, y presentación centrada en Unity/C#. El panel de código es una representación visual del perfil, no un editor interactivo. No se han incorporado dependencias ni código de la web de referencia.
