FROM hayd/alpine-deno:1.8.0

EXPOSE 1993

WORKDIR /app

COPY deps.ts /app
RUN deno cache --unstable deps.ts

ADD . /app
RUN deno cache --unstable main.ts

CMD ["run", "--allow-net", "--allow-read", "--unstable", "--cert=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt", "main.ts"]
