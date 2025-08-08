# Imagen base ligera con Node 18
FROM node:18-alpine

# Carpeta de trabajo
WORKDIR /app

# Copiamos solo package.json y package-lock.json primero (mejora cache)
COPY package*.json ./

# Instalamos dependencias de producción
RUN npm install --omit=dev

# Copiamos el resto del código
COPY . .

# Variable de puerto para Railway
ENV PORT=8080

# Exponemos el puerto
EXPOSE 8080

# Comando de arranque
CMD ["node", "index.js"]
