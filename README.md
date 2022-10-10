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

https://hub.docker.com/r/evictionlab/map-screenshot-gl

Find the image id of the local build that you want to tag and push:

```bash
docker image ls
```

E.g.:

```txt
REPOSITORY            TAG            IMAGE ID       CREATED         SIZE
map-screenshot-gl     latest         107dc945eca2   6 minutes ago   802MB
```

Tag the image, e.g.:

```bash
docker tag 107dc945eca2 evictionlab/map-screenshot-gl:latest
```

Push the image to Docker Hub, e.g.:

```bash
sudo docker push evictionlab/map-screenshot-gl:latest
```

## Notes
- the screenshot service pulls data from the tiles deployed at https://tiles.evictionlab.org/ as designated in https://evictionlab.org/map/assets/maps/style.json 
  - requests for states and counties will utilize `modeled` data, while requests for cities, tracts, and block groups will utilize `raw` data (as modeled data is not available for these smaller geographies)
