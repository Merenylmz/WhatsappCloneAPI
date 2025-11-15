# Temel imaj
FROM node:24

# Çalışma dizini
WORKDIR /app

# Bağımlılıkları kopyala
COPY package*.json ./
RUN npm install
RUN npm install nodemon --save-dev

# Kodları kopyala
COPY . .

# Portu aç
EXPOSE 3002

# Uygulamayı başlat
CMD ["npm", "run", "start:dev"]