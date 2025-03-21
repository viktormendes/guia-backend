# Estágio de build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia os arquivos de configuração do projeto
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Compila o projeto
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Copia apenas os arquivos necessários
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expõe a porta do servidor
EXPOSE ${SERVER_PORT}

# Comando para rodar a aplicação
CMD ["npm", "run", "start:prod"]