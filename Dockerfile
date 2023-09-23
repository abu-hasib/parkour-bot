FROM node:18
WORKDIR /.
COPY package*.json ./
RUN yarn
COPY . .
RUN ls src
RUN cat src/app.ts
RUN yarn build
EXPOSE 8080
CMD [ "node", "dist/server.js" ]