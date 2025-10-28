# --- STAGE 1: ETAPA DE CONSTRUCCIÓN (BUILD STAGE) ---
# Usamos una imagen de Node.js basada en Debian para máxima compatibilidad
FROM node:18-slim AS builder

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de definición de dependencias
COPY package.json ./

# Instala las dependencias
RUN npm install

# Copia el resto del código y construye la aplicación
COPY . .

# Limpiar cache de npm y node_modules para evitar conflictos de versiones
RUN npm cache clean --force && rm -rf node_modules package-lock.json && npm install

RUN npm run build


# ------------------------------------------------------------------------------------------------------


# --- STAGE 2: ETAPA FINAL (RUNNING STAGE) ---
# Usamos Nginx Alpine para servir los archivos, sigue siendo una imagen ligera
FROM nginx:alpine 

# Copia los archivos estáticos generados en la etapa 'builder'
# ¡Asegúrate de que la ruta /app/dist coincide con la salida de tu build de Vite!
COPY --from=builder /app/dist /usr/share/nginx/html 

# Expone el puerto por defecto de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]