#!/bin/bash

ACCESS_KEY=$1
SECRET_KEY=$2
API_GATEWAY_URL="https://ncloud.apigw.ntruss.com"
RESOURCE_URL="/cdn/v2/requestGlobalCdnPurge?cdnInstanceNo=$3&isWholePurge=true&isWholeDomain=true&responseFormatType=JSON"
TIMESTAMP=$(python -c 'import time; print(int(time.time() * 1000))')

function makeSignature() {
    nl=$'\\n'

    ACCESSKEY=$ACCESS_KEY
    SECRETKEY=$SECRET_KEY

    METHOD="GET"
    URI=$RESOURCE_URL

    SIG="$METHOD"' '"$URI"${nl}
    SIG+="$TIMESTAMP"${nl}
    SIG+="$ACCESSKEY"

    SIGNATURE=$(echo -n -e "$SIG"|iconv -t utf8 |openssl dgst -sha256 -hmac $SECRETKEY -binary|openssl enc -base64)
    echo $SIGNATURE
}

SIGNATURE=$(makeSignature)

curl -vs "$API_GATEWAY_URL$RESOURCE_URL" \
    -H "Content-Type: application/json" \
    -H "x-ncp-apigw-timestamp:$TIMESTAMP" \
    -H "x-ncp-iam-access-key:$ACCESS_KEY" \
    -H "x-ncp-apigw-signature-v2:$SIGNATURE"