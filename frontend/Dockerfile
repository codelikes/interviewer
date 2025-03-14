FROM node:18-alpine

WORKDIR /app

# Копируем файлы для установки зависимостей
COPY package.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .

# Запускаем приложение
CMD ["npm", "run", "dev"] 