FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE $PORT
CMD sh -c "sed -i 's/listen 80/listen '${PORT:-80}'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"