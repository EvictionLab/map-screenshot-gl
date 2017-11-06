const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mbgl = require('@mapbox/mapbox-gl-native');
const geoViewport = require('@mapbox/geo-viewport');
const request = require('request');
const app = require('express')();
const scales = require('./scales');

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
                callback(new Error(body));
            }
        });
    },
    ratio: 1
};

function getFillProp(layer, dataProp) {
    const dataScale = scales.filter(p => p.id === dataProp.split('-')[0])[0];
    return {
        property: dataProp,
        default: dataScale.default,
        stops: dataScale.fillStops.hasOwnProperty(layer) ? dataScale.fillStops[layer] : dataScale.fillStops['default']
    };
}

function processMapStyle(style, layer, dataProp, bubbleProp) {
    const yearSuffix = +dataProp.substr(-2);
    const censusYear = Math.floor(yearSuffix / 10) * 10;
    const censusYearSuffix = censusYear < 10 ? "0" + censusYear : censusYear.toString();
    const year = yearSuffix + (yearSuffix > 40 ? 1900 : 2000);
    style.layers = style.layers.map(l => {
        if (l.id.startsWith(layer)) {
            l.source = `us-${layer}-${censusYearSuffix}`;
            l.layout.visibility = 'visible';
            if (l.id === layer) {
                l.paint['fill-color'] = getFillProp(layer, dataProp);
            }
            if (l.id === `${layer}_null`) {
                l.filter = ['<', dataProp, 0];
            }
            if (l.type === 'circle') {
                l.paint['circle-radius'].property = bubbleProp;
                l.paint['circle-color'].property = bubbleProp;
                l.paint['circle-stroke-color'].property = bubbleProp;
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

// 48.31, 41.7, -82.1, -90.4
// Example request: http://localhost:3000/48.31/41.7/-82.1/-90.4/states/p-16/er-16
app.get('/:n/:s/:e/:w/:layer/:dataProp/:bubbleProp', (req, res) => {
    request({
        url: 'http://eviction-maps.s3-website.us-east-2.amazonaws.com/assets/style.json',
    }, (err, styleRes, body) => {
        if (styleRes.statusCode === 200) {
            const styleBody = JSON.parse(body);
            const map = new mbgl.Map(options);
            const style = processMapStyle(styleBody, req.params.layer, req.params.dataProp, req.params.bubbleProp);
            map.load(processMapStyle(styleBody, req.params.layer, req.params.dataProp, req.params.bubbleProp));

            const mapParams = geoViewport.viewport(
                [+req.params.w, +req.params.s, +req.params.e, +req.params.n],
                [256, 256]
            );
            map.render(mapParams, (err, buffer) => {
                if (err) console.error(err);

                map.release();

                const image = sharp(buffer, {
                    raw: {
                        width: 512,
                        height: 512,
                        channels: 4
                    }
                });
                image.png({ adaptiveFiltering: false });
                image.toBuffer((err, buffer, info) => {
                    if (!buffer) {
                        return res.status(404).send('Not found');
                    }
                    res.contentType('png');
                    return res.status(200).send(buffer);
                });
            });
        }
    });
});

app.listen(3000, () => console.log('Server running.'));