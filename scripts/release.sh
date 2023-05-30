network=$1

yarn
yarn run build-$network
yarn run electron-builder -mwl --arm64 --x64 --publish always --config ./electron-builder.$network.yml
