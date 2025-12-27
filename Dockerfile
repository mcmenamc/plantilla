# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Etapa 2: Producción con Nginx
FROM nginx:stable-alpine
# Copiamos el build de Vite (carpeta dist)
COPY --from=build /app/dist /usr/share/nginx/html
# Copiamos nuestra configuración de ruteo
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]