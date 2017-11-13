#!/bin/sh

set -e

echo "Starting TestRPC..."
node_modules/.bin/testrpc --gasLimit 1000000000000 >testrpc.log 2>&1 &
testrpc_pid="$!"
cleanup() {
    echo "Killing TestRPC..."
    kill -9 ${testrpc_pid}
}
trap cleanup EXIT

echo "TestRPC running on PID ${testrpc_pid}. Waiting three seconds for startup..."
sleep 3

echo "Starting truffle test..."
node_modules/.bin/truffle test
echo "Done."
