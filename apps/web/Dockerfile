FROM node:22-alpine

WORKDIR /app

ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci --legacy-peer-deps
RUN npm -w apps/web run build

EXPOSE 5173

CMD ["npm", "-w", "apps/web", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
