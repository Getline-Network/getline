Getline Integration tests
=========================

These are end-to-end integration tests of the metabackend, smartcontracts and getline.ts components.

The tests are managed using `docker-compose`, which brings up the following components:
 - `ganache`, a fake blockchain RPC server
 - a PostgreSQL instance
 - a metabackend instance that serves out contracts deployed on `ganache`
 - a few other utility containers to build and deploy the dapp and other functionality

Running
-------

Assuming you have `docker-compose` installed, it should be enough to go into the root of the monorepo and run

    sh production/ci/intergration/run.sh

The script will execute all the requires steps and is safe to re-run. If you want to skip some steps, you can set `skip_{step name but with hyphens replaced by underscores}` to non-empty in your environment, eg:

    skip\_images\_build=1 sh production/ci/intergration/run.sh

To quickly re-run the getline.ts tests while developing, you can do the following after runing `run.sh` for the first time:

    docker-compose -f production/ci/integration/docker-compose.yml run --rm -v $(pwd)/getline.ts/test:/app/getline.ts/test getline.ts yarn run test


