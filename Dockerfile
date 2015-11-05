FROM node:4.1.2
COPY . /nogueira-producer
WORKDIR /nogueira-producer
RUN npm install

EXPOSE 9471

CMD ["/bin/sh", "-c", "node ."]
