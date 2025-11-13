# ---- Etapa 1: Build ----
# Usamos una imagen de Node.js para construir la aplicación Angular
FROM node:20-alpine AS builder

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos de dependencias
COPY package.json package-lock.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente de la aplicación
COPY . .

# Construimos la aplicación para producción.
# El resultado estará en /app/dist/proy-plus/browser
RUN npm run build

# ---- Etapa 2: Serve ----
# Usamos una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:1.25-alpine

# Copiamos los archivos construidos desde la etapa 'builder' al directorio web de Nginx
COPY --from=builder /app/dist/proy-plus /usr/share/nginx/html

# Exponemos el puerto 80 (puerto por defecto de Nginx)
EXPOSE 80