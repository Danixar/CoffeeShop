FROM hayd/ubuntu-deno:latest

WORKDIR /usr/src/app

COPY deps.ts . 

# Caching all dependencies
RUN deno cache deps.ts

ADD . .

# Caching main file and compiling it
RUN deno cache server.ts

EXPOSE 5000

CMD ["run", "--assert-net", "server.ts"]