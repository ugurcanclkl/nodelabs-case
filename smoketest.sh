set -euo pipefail
HOST=${HOST:-http://localhost:3000}
RAND=$RANDOM

json() { jq -r "$1"; }

echo "✔ register … $(
  curl -s -X POST $HOST/api/auth/register \
    -H 'Content-Type: application/json' \
    -d '{"username":"u'$RAND'","email":"u'$RAND'@x.dev","password":"secret"}' | json '.accessToken ? // "fail"')"

TOKENS=$(curl -s -X POST $HOST/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"u'$RAND'@x.dev","password":"secret"}')
ACCESS=$(echo $TOKENS | json '.accessToken')
REFRESH=$(echo $TOKENS | json '.refreshToken')

echo "✔ login … ok"

echo "✔ refresh … $(curl -s -X POST $HOST/api/auth/refresh -H 'Content-Type: application/json' \
  -d '{"refreshToken":"'$REFRESH'"}' | json '.accessToken? // "fail"')"

CONVO=$(curl -s -X POST $HOST/api/conversations -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' -d '{"members":[]}')
CID=$(echo $CONVO | json '._id')
echo "✔ create conversation … ok"

curl -s -X POST $HOST/api/messages -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d '{"conversationId":"'$CID'","text":"hello from smoketest"}' > /dev/null

echo "✔ send message … ok"

sleep 1
RES=$(curl -s "$HOST/api/messages/search?q=hello")
[[ $RES == *"hello from smoketest"* ]] && echo "✔ search message (ES) … ok" || echo "❌ search failed"