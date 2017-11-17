# getline-frontend

> This is the frontend app for the Getline Distributed P2P Lending Platform

## Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn run dev

# build for production with minification
yarn run build

# build for production and view the bundle analyzer report
yarn run build --report

# run unit tests
yarn run unit

# run all tests
yarn run test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## Production Deployment

Assuming you have `gcloud` installed and configured, here's how to deploy the code:
    
    yarn
    yarn run build
    gcloud --project getline-loans-demo app deploy

You might want to pass --no-promote to `gcloud app deploy` and then migrate traffic manually between versions.

