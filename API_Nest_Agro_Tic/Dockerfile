# Etapa 1: Construcción del proyecto
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar todo el código
COPY . .

# Compilar el proyecto NestJS
RUN npm run build

# Etapa 2: Imagen final para producción
FROM node:20-alpine
WORKDIR /app

# Copiar solo lo necesario desde la etapa anterior
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
