# Resumen de Despliegue en Producción - Comunicador

La aplicación **Esta es mi voz sin límites** ha sido desplegada exitosamente en tu servidor VPS mediante Coolify y GitHub.

---

## 🌐 Enlaces de Acceso Oficial

- **URL de Producción (HTTPS):** [https://comunicador.agrolara.dedyn.io](https://comunicador.agrolara.dedyn.io)
- **Repositorio de GitHub:** [https://github.com/agrolara/comunicador](https://github.com/agrolara/comunicador)
- **Panel de Coolify:** [http://148.116.104.222:8000](http://148.116.104.222:8000) (Aplicación: `comunicador`, UUID: `nkhaee8vsybk648iwpsrkk9g`)

---

## ⚙️ Arquitectura de Despliegue

1. **Código Fuente:** Repositorio en GitHub sincronizado en la rama `main`.
2. **Contenedor Docker:** Construcción multi-etapa:
   - **Etapa de Compilación:** `node:20-alpine` ejecutando Vite y TailwindCSS.
   - **Etapa de Ejecución:** `nginx:alpine` sirviendo los archivos estáticos en el puerto `80`.
3. **Enrutamiento SPA:** Servidor Nginx configurado con `try_files $uri $uri/ /index.html` para soportar navegación fluida sin recargas.
4. **Proxy Inverso y SSL:** Traefik en Coolify con certificado SSL automático Let's Encrypt para `comunicador.agrolara.dedyn.io`.
5. **Caché y Rendimiento:** Compresión Gzip activada y cabeceras de caché inmutable para assets estáticos (fuentes, imágenes y scripts).

---

## 📱 Acceso para Terapeutas y Comunidad

Cualquier terapeuta o fonoaudióloga puede acceder directamente desde su teléfono, tablet o computador ingresando a:
👉 **[https://comunicador.agrolara.dedyn.io](https://comunicador.agrolara.dedyn.io)**

Además, al ser una **Progressive Web App (PWA)**, pueden presionar *"Instalar aplicación"* o *"Agregar a la pantalla de inicio"* desde Chrome o Safari para usarla como una aplicación nativa.
