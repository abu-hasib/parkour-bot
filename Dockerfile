FROM node:18
WORKDIR /.
COPY package*.json ./
RUN yarn
COPY . .
RUN npx prisma migrate dev --name add-fields
RUN yarn build
EXPOSE 8080
CMD [ "node", "dist/server.js" ]