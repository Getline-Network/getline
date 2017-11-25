#!/bin/sh

set -e -o pipefail

if [ ! -e .ROOT ] ; then
    echo "Please run this script from the root of the monorepo, ie.:" >&2
    echo "    sh production/ci/integration/run.sh" >&2
    exit 1
fi

DAPP_BUILD_VOLUME=integration_dapp-build
compose="docker-compose -f production/ci/integration/docker-compose.yml --no-ansi"

step() {
    prefix="$1"
    shift

    var="skip_$(echo ${prefix} | sed -e 's,-,_,')"
    skip="${!var}"
    if [ "${skip}" != "" ] ; then
        echo "[${prefix}] Skipping..."
        return
    fi
    cmd="$@"

    echo "[${prefix}] ${cmd}"
    "$@" 2>&1 | sed "s/^/[${prefix}]: /"
}

echo "Rebuild all docker-compose containers."
step images-build $compose build

echo "Kill all docker-compose containers."
step containers-rm $compose kill 
step containers-rm $compose rm -f -v

echo "Recreate volume for DApp build files."
step volume-recreate docker volume rm -f ${DAPP_BUILD_VOLUME}
step volume-recreate docker volume create ${DAPP_BUILD_VOLUME}

echo "Start Ganache with an empty blockchain and postgres with an empty db."
step ganache-up $compose up -d ganache
step psql-up $compose up -d psql

echo "Build DApp into volume and deploy into Ganache."
step truffle-deploy \
        $compose run --rm -v ${DAPP_BUILD_VOLUME}:/project/dapp/build dapp \
        yarn run \
        truffle --network rinkeby deploy

echo "Initialize metabackend database."
step metabackend-init \
        $compose run --rm metabackend \
        /app/metabackend -logtostderr \
        -db_data_source "user=postgres password=postgresci dbname=postgres host=psql sslmode=disable" \
        -db_init_schema


echo "Start metabackend."
step metabackend-up $compose up -d metabackend

echo "Query metabackend to make sure it's running..."
$compose run --rm grpc ls metabackend:2000 | grep pb.Metabackend
echo "Service running."

echo "Running getline.ts tests..."
$compose run --rm getline.ts yarn run test
echo "Integration tests passed."
