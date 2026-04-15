FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ARG VITE_WHATSAPP_LINK

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WHATSAPP_LINK=$VITE_WHATSAPP_LINK

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80