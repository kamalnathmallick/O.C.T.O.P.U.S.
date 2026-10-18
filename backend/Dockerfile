FROM node:20-alpine

# Install OpenSSL 1.1 compatibility for Prisma
RUN apk add --no-cache openssl1.1-compat

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]