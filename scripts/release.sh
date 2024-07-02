network=$1
targets=${2:-"mwl"}

echo "$network, $targets"

yarn
yarn run build-$network
yarn run electron-builder -$targets --arm64 --x64 --publish always --config ./electron-builder.$network.yml
