FROM node:10.14.0-alpine as BUILDER

WORKDIR /code

COPY ./package.json ./package-lock.json ./
RUN npm ci && npm cache clean --force

FROM node:10.14.0-alpine

WORKDIR /code

COPY . .
COPY --from=BUILDER /code/node_modules ./node_modules

RUN apk add postgresql-client  

# Yeah don't include secrets in a Dockerfile, this is for the purposes of seeding
# the example db
RUN printf "database:*:*:postgres:thepassword" > ~/.pgpass && chmod 0600 ~/.pgpass

CMD ["./entrypoint.sh"]
