set -e

docker compose up -d mongo

export JWT_SECRET=$(grep ^JWT_SECRET= deploy/env/api.env | cut -d= -f2-)

TOKEN=$(docker run --rm \
        --env MONGO=mongodb://mongo:27017/chat \
        --env JWT_SECRET=$JWT_SECRET \
        --network nodelabs-case_default \
        -v "$(pwd)/api":/app -w /app node:20-alpine \
        sh -c "npm i -s && npm run gen-token --silent")

echo "Generated INTERNAL_TOKEN:"
echo "$TOKEN"

echo -e "INTERNAL_TOKEN=$TOKEN" > deploy/env/worker.env
echo "deploy/env/worker.env updated ✔"

echo "Rebuilding worker image..."
docker compose build worker
echo "Done. restart with: docker compose up -d worker"
