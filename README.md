# Mapbox GL Screenshots

Microservice based on [tileserver-gl](https://github.com/klokantech/tileserver-gl) for creating screenshots of different map views from the Eviction Lab map tool based on parameters.

## Setup

Build locally with `docker build -t map-screenshot-gl:latest .` and run with `docker run -t -p 3000:3000 map-screenshot-gl:latest`. You'll be able to access results at `localhost:3000`.

## Local install

```bash
cd map-screenshot-gl
nvm install
npm config set python $(which python3)
cd src
npm install
```

## Pushing builds to Docker Hub

https://hub.docker.com/r/hyperobjekt/map-screenshot-gl

Build and tag the image id of the local build that you want to tag and push:

```bash
docker build -t hyperobjekt/map-screenshot-gl:latest .
```

Push the image to Docker Hub, e.g.:

```bash
docker push hyperobjekt/map-screenshot-gl:latest
```

## Updating the CloudFormation stack to deploy to ECS

https://awscli.amazonaws.com/v2/documentation/api/latest/reference/cloudformation/update-stack.html

```bash
./deploy.sh
```

## Notes

- the screenshot service pulls data from the tiles deployed at https://tiles.evictionlab.org/ as designated in https://evictionlab.org/tool/assets/style.json
- requests for states and counties will utilize `modeled` data, while requests for cities, tracts, and block groups will utilize `raw` data (as modeled data is not available for these smaller geographies)

## Links

 - GitHub repo: https://github.com/Hyperobjekt/map-screenshot-gl
 - Docker Hub repo: https://hub.docker.com/repository/docker/hyperobjekt/map-screenshot-gl
 - CloudFormation stack: https://us-east-1.console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/events?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false&stackId=arn%3Aaws%3Acloudformation%3Aus-east-1%3A318011162599%3Astack%2Fmap-screenshot-cluster%2Fb699c170-2d7a-11e8-980b-5044763dbb7b
 - ECS cluster: https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/map-screenshot-cluster-ECSCluster-6CEKKPS6CZ9O/services?region=us-east-1
 - ECS web task: https://us-east-1.console.aws.amazon.com/ecs/v2/task-definitions/map-screenshot-cluster-web-task?region=us-east-1
 - Screenshot service: https://screenshot.evictionlab.org/48.31/41.7/-82.1/-90.4/states/p-16/efr-16/26/0
