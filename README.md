
# FocusTrack – Backend

Este es el backend de **FocusTrack**, una aplicación web que permite a los usuarios registrar y visualizar el tiempo que pasan usando distintos dispositivos, aplicaciones o sitios web. El objetivo principal es generar conciencia sobre el uso del tiempo frente a las pantallas.

## Tecnologías utilizadas

- Node.js
- Express.js
- PostgreSQL

## Requisitos previos

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

## Instalación y ejecución

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd FOCUSTRACKBACKEND
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura las variables de entorno en un archivo `.env` en la raíz del proyecto. Por ejemplo:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=focustrack
   DB_PORT=5432
   JWT_SECRET=tu_secreto
   ```

4. Ejecuta el servidor:

   ```bash
   npm run dev
   ```

   o

   ```bash
   node index.js
   ```

## Estructura del proyecto

```
FOCUSTRACKBACKEND/
├── routes/
│   ├── activityRoutes.js
│   ├── appRoutes.js
│   ├── authRoutes.js
│   ├── deviceRoutes.js
│   ├── historial.js
│   └── reportRoutes.js
├── middleware/
├── __tests__/
├── db.js
├── app.js
├── index.js
├── .env
```

## Endpoints principales

- `POST /auth/login` – Login de usuario
- `POST /auth/register` – Registro de usuario
- `GET /devices` – Obtener dispositivos
- `POST /activities` – Registrar actividad
- `GET /historial` – Historial de uso
- `GET /reports` – Visualización de estadísticas

## Autor

Desarrollado por angieccr12 - Sofiaflorezz.
