# Mapbox GL Screenshots

Microservice based on [tileserver-gl](https://github.com/klokantech/tileserver-gl) for creating screenshots of different map views from the Eviction Lab map tool based on parameters.

## Setup

Build locally with `docker build -t map-screenshot-gl:latest .` and run with `docker run -t -p 3000:3000 map-screenshot-gl:latest`. You'll be able to access results at `localhost:3000`.