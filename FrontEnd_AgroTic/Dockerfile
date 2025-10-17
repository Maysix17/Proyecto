# Etapa 1: Construir la aplicación
FROM node:20-bullseye AS build

WORKDIR /app

# Copiamos los archivos de dependencias
COPY package*.json ./

# Instalamos dependencias y forzamos la instalación del binario correcto de rollup
RUN npm install --omit=optional && \
    npm install rollup@4.9.6 --force

# Copiamos el resto del código fuente
COPY . .

# Compilamos la app de producción
RUN npm run build

# Etapa 2: Servir la app con Nginx
FROM nginx:alpine

# Copiamos los archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
