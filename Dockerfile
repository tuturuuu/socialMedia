FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY socialMediaFrontEnd/package*.json ./
RUN npm ci

COPY socialMediaFrontEnd/ ./
RUN npm run build

FROM node:20-alpine AS backend-runtime
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
