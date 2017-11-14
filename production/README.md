Getline.in production deployment
================================

Quickstart
----------

You will need:
 - a Kubernetes cluster on GCE
 - a PostgreSQL cloudsql instance 

Then, to run geth (you will have to add a persistent disk via the Google Cloud console):

    kubectl apply -f production/k8s/geth/deployment.yaml
    kubectl apply -f production/k8s/geth/service.yaml

And, to run the metabackend (you will have to configure the database secrets in k8s):

    kubectl apply -f production/k8s/metabackend/deployment.yaml

Version management
------------------

Currently version management is done manually.

To build a new version of metabackend:

    TAG=gcr.io/third-hope-184611/metabackend:$(date +%s)
    docker build -f production/metabackend/Dockerfile -t ${TAG} .
    gcloud docker -- push ${TAG}

Then edit production/k8s/metabackend/deployment.yaml to point to the new tag, and reapply it.

