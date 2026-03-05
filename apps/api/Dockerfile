FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY apps ./apps
COPY packages ./packages

RUN npm ci --legacy-peer-deps
RUN npm -w apps/api exec prisma generate
RUN npm -w apps/api run build

EXPOSE 4000

CMD ["npm", "-w", "apps/api", "run", "start:prod"]
