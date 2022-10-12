#!/usr/bin/env bash

set -o pipefail
set -e
set -x

docker build -t hyperobjekt/map-screenshot-gl:latest .
docker push hyperobjekt/map-screenshot-gl:latest

TEMPLATE_VERSION_FILENAME="map-screenshot-gl-ecs-date:$(date -r ./ecs.yml +'%Y-%m-%dT%H:%M:%SZ')-git:$(git rev-parse --short HEAD)-file:$(sha256sum ecs.yml | head -c 20).yml"
export TEMPLATE_VERSION_FILENAME

aws --profile hyperobjekt --region us-east-1 \
  s3 cp ./ecs.yml "s3://map-screenshot-gl-cloudformation/${TEMPLATE_VERSION_FILENAME}"

aws --profile hyperobjekt --region us-east-1 \
  cloudformation update-stack \
    --stack-name map-screenshot-cluster \
    --template-url "https://map-screenshot-gl-cloudformation.s3.amazonaws.com/${TEMPLATE_VERSION_FILENAME}" \
    --capabilities CAPABILITY_IAM \
    --parameters \
      ParameterKey=KeyName,ParameterValue=ami-testing \
      ParameterKey=LoadBalancerCertificateArn,ParameterValue=arn:aws:acm:us-east-1:318011162599:certificate/e73f1755-88e9-4a29-8909-e39f02cd04bf \
      ParameterKey=SubnetId,ParameterValue="subnet-0abbf006\,subnet-3d520d11\,subnet-4f51862b\,subnet-7a0d1032\,subnet-c404549e\,subnet-dbc034e4" \
      ParameterKey=VpcId,ParameterValue=vpc-7e251507

aws --profile hyperobjekt --region us-east-1 \
  cloudformation wait stack-update-complete \
    --stack-name map-screenshot-cluster
