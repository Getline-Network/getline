if [ ! -e /app/rinkeby/geth/chaindata ]; then
	echo "Initializing rinkeby from rinkeby.json..."
	geth --datadir=/app/rinkeby init /app/rinkeby.json
fi
echo "Starting geth..."
exec geth --networkid=4 --datadir=/app/rinkeby --bootnodes=enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303 --rpc --rpcapi db,eth,net,web3,personal --rpcaddr 0.0.0.0
