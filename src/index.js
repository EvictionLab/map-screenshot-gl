const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mbgl = require('@mapbox/mapbox-gl-native');
const geoViewport = require('@mapbox/geo-viewport');
const request = require('request');
const app = require('express')();
const scales = require('./scales');

const colors = ['rgba(226,64,0,0.8)', 'rgba(67,72,120,0.8)', 'rgba(44,137,127,0.8)'];

const options = {
    request: (req, callback) => {
        request({
            url: req.url.replace("%2b", "+"),
            encoding: null,
            gzip: true
        }, (err, res, body) => {
            if (err) {
                callback(err);
            } else if (res.statusCode == 200) {
                const response = {};

                if (res.headers.modified) { response.modified = new Date(res.headers.modified); }
                if (res.headers.expires) { response.expires = new Date(res.headers.expires); }
                if (res.headers.etag) { response.etag = res.headers.etag; }

                response.data = body;

                callback(null, response);
            } else {
                callback(null, res);
            }
        });
    },
    ratio: 1
};

function getProp(layer, dataProp) {
    const dataScale = scales.dataAttributes.filter(p => p.id === dataProp.split('-')[0])[0];
    return {
        property: dataProp,
        default: dataScale.default,
        stops: dataScale.stops.hasOwnProperty(layer) ? dataScale.stops[layer] : dataScale.stops['default']
    };
}

function convertExpressionToFunction(layer, dataProp) {
    const dataExp = scales.bubbleAttributes.filter(p => p.id === dataProp.split('-')[0])[0];
    const expression = dataExp.expressions.hasOwnProperty(layer) ? dataExp.expressions[layer] : dataExp.expressions['default'];

    const dataFunc = {
        property: dataProp,
        stops: []
    };

    const scaleLevels = expression.slice(3)[0].slice(3);
    for (let i = 0; i < scaleLevels.length; i += 2) {
        const zoomLevel = scaleLevels[i];
        const zoomValues = scaleLevels[i + 1].slice(3);
        for (let zi = 0; zi < zoomValues.length; zi += 2) {
            dataFunc.stops.push([
                { zoom: zoomLevel, value: zoomValues[zi] }, zoomValues[zi + 1]
            ]);
        }
    }
    return dataFunc;
}

function processMapStyle(style, params) {
    const yearSuffix = +params.dataProp.substr(-2);
    const censusYear = Math.floor(yearSuffix / 10) * 10;
    const censusYearSuffix = censusYear < 10 ? "0" + censusYear : censusYear.toString();
    const year = yearSuffix + (yearSuffix > 40 ? 1900 : 2000);
    const requiredProps = ['layout', 'paint'];
    const layerSource = style.sources
    style.layers = style.layers.filter(l => l.id !== 'counties_text' && !l.id.startsWith('city')).map(l => {
        if (l.id.startsWith(params.layer)) {
            l.source = `us-${params.layer}-${censusYearSuffix}`;
            // Set required props to empty object if not present
            requiredProps.forEach(p => {
                if (!l.hasOwnProperty(p)) { l[p] = {}; }
            });
            l.layout.visibility = 'visible';
            if (l.id === params.layer) {
                l.paint['fill-color'] = getProp(params.layer, params.dataProp);
            }
            if (l.id === `${params.layer}_null`) {
                l.filter = ['<', params.dataProp, 0];
            }
            if (l.type === 'circle') {
                l.filter = undefined;
                l.paint['circle-color'] = {
                    property: params.bubbleProp,
                    default: 'rgba(255,4,0,0.65)',
                    stops: [[-1, 'rgba(255,255,255,0.65)'], [0, 'rgba(255,4,0,0.65)']]
                };
                l.paint['circle-stroke-color'] = {
                    property: params.bubbleProp,
                    default: 'rgba(255,255,255,1)',
                    stops: [[-1, 'rgba(128,128,128,1)'], [0, 'rgba(255,255,255,1)']]
                };
                l.paint['circle-radius'] = convertExpressionToFunction(params.layer, params.bubbleProp);
            }
        }
        if (l.id.startsWith('hover')) {
            l.source = `us-${params.layer}-${censusYearSuffix}`;
            l['source-layer'] = params.layer;
            l.filter = ['==', 'GEOID', params.geoid];
            // Double line width for visibility
            l.paint['line-width'] = l.paint['line-width'] * 2;
            if (l.id === 'hover') {
                l.paint['line-color'] = colors[params.idx];
            }
        }
        return l;
    });
    return style;
}

// Return 200 for load balancer health check
app.get('/', (req, res) => {
    return res.sendStatus(200);
});

// Example requests:
// - http://localhost:3000/48.31/41.7/-82.1/-90.4/states/p-16/efr-16/26/0
// - http://localhost:3000/48.31/41.7/-82.1/-90.4/states/p-16/er-16/26/0
// - http://localhost:3000/54.138/37.584/-82.875/-112.879/states/p-16/er-16/38/0
// - http://localhost:3000/42.21/41.8/-87.7/-88.5/tracts/p-16/er-16/26/1
app.get('/:n/:s/:e/:w/:layer/:dataProp/:bubbleProp/:geoid/:idx', (req, res) => {
    request({
        url: 'https://evictionlab.org/map/assets/maps/style.json',
    }, (err, styleRes, body) => {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            if (typeof styleRes === 'undefined') {
                res.sendStatus(500);
            } else if (styleRes.statusCode === 200) {
                const styleBody = JSON.parse(body);
                const map = new mbgl.Map(options);
                const style = processMapStyle(styleBody, req.params);
                map.load(style);

                const mapDimensions = {
                    width: +req.query['width'] || 800,
                    height: +req.query['height'] || 800
                };
                const mapParams = geoViewport.viewport(
                    [+req.params.w, +req.params.s, +req.params.e, +req.params.n],
                    [mapDimensions.width / 2.5, mapDimensions.height / 2.5]
                );
                map.render(Object.assign(mapParams, mapDimensions), (err, buffer) => {
                    if (err) {
                        console.error(err);
                        res.send(err);
                    } else {
                        map.release();
                        const image = sharp(buffer, {
                            raw: Object.assign({ channels: 4 }, mapDimensions)
                        });
                        res.set('Content-Type', 'image/png');
                        image.png().toBuffer()
                            .then(result => {
                                res.send(result);
                            });
                    }
                });
            }
        }
    });
});

app.listen(3000, () => console.log('Server running.'));
