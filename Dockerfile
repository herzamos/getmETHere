FROM eu.gcr.io/vseth-public/node12:charlie AS builder
RUN apt-get install -y --no-install-recommends git
WORKDIR /app
COPY package.json .
# COPY package-lock.json . #No
COPY tsconfig.json .
RUN npm install
COPY . .
COPY ./public ./public
RUN npm run build

# And then copy over node_modules, etc from that stage to the smaller base image
FROM eu.gcr.io/vseth-public/node12:charlie
WORKDIR /app
COPY deployment/starter.yml /etc/cinit.d/starter.yml
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=app-user --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/totally_not_a_json.json ./totally_not_a_json.json
COPY --from=builder /app/totally_not_dijkstra.json ./totally_not_dijkstra.json
COPY --from=builder /app/totally_not_hardcoded.json ./totally_not_hardcoded.json
EXPOSE 3000
