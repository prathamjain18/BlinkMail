# Use official Node.js image to build the app
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY . .
COPY .env.production .env.production
RUN npm ci
RUN npm run build

# Use a lightweight web server to serve static files
FROM node:20-slim AS production
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"] 