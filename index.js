const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mbgl = require('@mapbox/mapbox-gl-native');
const request = require('request');
const app = require('express')();

const options = {
    request: (req, callback) => {
        request({
            url: req.url,
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

const map = new mbgl.Map(options);

app.get('/', (req, res) => {
    request({
        url: 'http://eviction-maps.s3-website.us-east-2.amazonaws.com/assets/style.json',
    }, (err, styleRes, body) => {
        if (styleRes.statusCode === 200) {
            const styleBody = JSON.parse(body);
            map.load(styleBody);

            map.render({ zoom: 3, center: [-98.5556199, 39.8097343] }, (err, buffer) => {
                if (err) throw err;

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