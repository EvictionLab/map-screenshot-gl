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
                callback(new Error(JSON.parse(body).message));
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
    expression[2][2][1] = dataProp;

    const dataFunc = {
        property: dataProp,
        stops: []
    };

    const baseVal = expression[2][1];
    const scaleLevels = expression.slice(3)[0].slice(3);
    for (let i = 0; i < scaleLevels.length; i += 2) {
        let divide = scaleLevels[i + 1].slice(-1);
        divide = isNaN(divide) ? divide[1] * divide[2] : divide;
        const zoomArr = [
            [ { zoom: scaleLevels[i], value: 0 }, 0 ],
            [ { zoom: scaleLevels[i], value: baseVal }, baseVal / divide]
        ];
        dataFunc.stops = dataFunc.stops.concat(zoomArr);
    }
    return dataFunc;
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
                l.paint['fill-color'] = getProp(layer, dataProp);
            }
            if (l.id === `${layer}_null`) {
                l.filter = ['<', dataProp, 0];
            }
            if (l.type === 'circle') {
                l.filter = ['>', bubbleProp, -1];
                l.paint['circle-stroke-color'].property = bubbleProp;
                l.paint['circle-radius'] = convertExpressionToFunction(layer, bubbleProp);
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
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            if (typeof styleRes === 'undefined') {
                res.sendStatus(500);
            } else if (styleRes.statusCode === 200) {
                const styleBody = JSON.parse(body);
                const map = new mbgl.Map(options);
                const style = processMapStyle(styleBody, req.params.layer, req.params.dataProp, req.params.bubbleProp);
                map.load(style);

                const mapParams = geoViewport.viewport(
                    [+req.params.w, +req.params.s, +req.params.e, +req.params.n],
                    [256, 256]
                );
                map.render(mapParams, (err, buffer) => {
                    if (err) {
                        console.error(err);
                        res.send(err);
                    } else {
                        map.release();
                        const image = sharp(buffer, {
                            raw: {
                                width: 512,
                                height: 512,
                                channels: 4
                            }
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