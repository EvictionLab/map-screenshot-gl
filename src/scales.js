const colorScales = {
    3: [
        'rgba(238, 226, 239, 0.7)',
        'rgba(137, 140, 206, 0.8)',
        'rgba(64, 71, 124, 0.9)'
    ],
    5: [
        'rgba(215, 227, 244, 0.7)',
        'rgba(170, 191, 226, 0.75)',
        'rgba(133, 157, 204, 0.8)',
        'rgba(81, 101, 165, 0.85)',
        'rgba(37, 51, 132, 0.9)'
    ]
};

function getScale(scaleVals) {
    const nullArr = [[-1.0, 'rgba(0, 0, 0, 0)']];
    return nullArr.concat(colorScales[scaleVals.length].map((v, i) => [scaleVals[i], v]));
}

module.exports = {
    dataAttributes: [
        {
            'id': 'none',
            'name': 'None',
            'langKey': 'STATS.NONE',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': [
                    [0, 'rgba(0, 0, 0, 0)']
                ]
            }
        },
        {
            'id': 'p',
            'name': 'Population',
            'langKey': 'STATS.POPULATION',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 50000, 100000]),
                'block-groups': getScale([0, 1250, 2500, 3750, 5000]),
                'tracts': getScale([0, 2500, 5000, 7500, 10000]),
                'cities': getScale([0, 250000, 500000, 750000, 1000000]),
                'counties': getScale([0, 250000, 500000, 750000, 1000000]),
                'states': getScale([0, 7500000, 15000000, 22500000, 30000000])
            }
        },
        {
            'id': 'pr',
            'name': 'Poverty Rate',
            'langKey': 'STATS.POVERTY_RATE',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 5, 10, 15, 20])
            }
        },
        {
            'id': 'pro',
            'name': '% Renter Occupied',
            'langKey': 'STATS.PCT_RENTER',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 15, 30, 45, 60])
            }
        },
        {
            'id': 'mgr',
            'name': 'Median Gross Rent',
            'langKey': 'STATS.MED_RENT',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 300, 600, 900, 1200])
            }
        },
        {
            'id': 'mpv',
            'name': 'Median Property Value',
            'langKey': 'STATS.MED_PROPERTY',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 50000, 100000, 150000, 200000])
            }
        },
        {
            'id': 'rb',
            'type': 'choropleth',
            'langKey': 'STATS.RENT_BURDEN',
            'format': 'percent',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([10, 20, 30, 40, 50])
            }
        },
        {
            'id': 'mhi',
            'name': 'Median Household Income',
            'langKey': 'STATS.MED_INCOME',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25000, 50000, 75000, 100000])
            }
        },
        {
            'id': 'pw',
            'name': '% White',
            'langKey': 'STATS.PCT_WHITE',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'paa',
            'name': '% African American',
            'langKey': 'STATS.PCT_AFR_AMER',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'ph',
            'name': '% Hispanic/Latinx',
            'langKey': 'STATS.PCT_HISPANIC',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'pai',
            'name': '% American Indian/Alaskan Native',
            'langKey': 'STATS.PCT_AMER_INDIAN',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'pa',
            'name': '% Asian',
            'langKey': 'STATS.PCT_ASIAN',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'pnp',
            'name': '% Native Hawaiian or Pacific Islander',
            'langKey': 'STATS.PCT_HAW_ISL',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'pm',
            'name': '% Multiple Races',
            'langKey': 'STATS.PCT_MULTIPLE',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        },
        {
            'id': 'po',
            'name': '% Other Race',
            'langKey': 'STATS.PCT_OTHER',
            'default': 'rgba(0, 0, 0, 0)',
            'stops': {
                'default': getScale([0, 25, 50, 75, 100])
            }
        }
    ],
    bubbleAttributes: [
        {
            'id': 'none',
            'name': 'None',
            'langKey': 'STATS.NONE',
            'default': 0,
            'expressions': {
                'default': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        0, ['/', ['var', 'data_prop'], 1],
                        1, ['/', ['var', 'data_prop'], 1]
                    ]
                ]
            }
        },
        {
            'id': 'er',
            'name': 'Judgment Rate',
            'langKey': 'STATS.JUDGMENT_RATE',
            'default': 0,
            'expressions': {
                'default': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        4, ['/', ['var', 'data_prop'], 4],
                        6, ['/', ['var', 'data_prop'], 3],
                        8, ['/', ['var', 'data_prop'], 2],
                        9, ['/', ['var', 'data_prop'], 1],
                        10, ['/', ['var', 'data_prop'], 0.5]
                    ]
                ],
                'states': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        2, ['/', ['var', 'data_prop'], 0.8],
                        4, ['/', ['var', 'data_prop'], 0.4],
                        6, ['/', ['var', 'data_prop'], 0.2]
                    ]
                ],
                'counties': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        2, ['/', ['var', 'data_prop'], 4],
                        4, ['/', ['var', 'data_prop'], 2],
                        6, ['/', ['var', 'data_prop'], 1],
                        8, ['/', ['var', 'data_prop'], 0.5]
                    ]
                ],
                'cities': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        4, ['/', ['var', 'data_prop'], 4],
                        6, ['/', ['var', 'data_prop'], 3],
                        8, ['/', ['var', 'data_prop'], 2],
                        9, ['/', ['var', 'data_prop'], 1],
                        10, ['/', ['var', 'data_prop'], 0.5]
                    ]
                ],
                'tracts': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        8, ['/', ['var', 'data_prop'], 4],
                        10, ['/', ['var', 'data_prop'], 1],
                        12, ['/', ['var', 'data_prop'], 0.5]
                    ]
                ],
                'block-groups': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        8, ['/', ['var', 'data_prop'], 8],
                        10, ['/', ['var', 'data_prop'], 2],
                        12, ['/', ['var', 'data_prop'], 1]
                    ]
                ]
            }
        },
        {
            'id': 'efr',
            'name': 'Filing Rate',
            'langKey': 'STATS.FILING_RATE',
            'default': 0,
            'expressions': {
                'default': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        4, ['/', ['var', 'data_prop'], ['*', 4, 1.5]],
                        6, ['/', ['var', 'data_prop'], ['*', 3, 1.5]],
                        8, ['/', ['var', 'data_prop'], ['*', 2, 1.5]],
                        9, ['/', ['var', 'data_prop'], ['*', 1, 1.5]],
                        10, ['/', ['var', 'data_prop'], ['*', 0.5, 1.5]]
                    ]
                ],
                'states': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        2, ['/', ['var', 'data_prop'], ['*', 0.8, 1.5]],
                        4, ['/', ['var', 'data_prop'], ['*', 0.4, 1.5]],
                        6, ['/', ['var', 'data_prop'], ['*', 0.2, 1.5]]
                    ]
                ],
                'counties': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        2, ['/', ['var', 'data_prop'], ['*', 4, 1.5]],
                        4, ['/', ['var', 'data_prop'], ['*', 2, 1.5]],
                        6, ['/', ['var', 'data_prop'], ['*', 1, 1.5]],
                        8, ['/', ['var', 'data_prop'], ['*', 0.5, 1.5]]
                    ]
                ],
                'cities': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        4, ['/', ['var', 'data_prop'], ['*', 4, 1.5]],
                        6, ['/', ['var', 'data_prop'], ['*', 3, 1.5]],
                        8, ['/', ['var', 'data_prop'], ['*', 2, 1.5]],
                        9, ['/', ['var', 'data_prop'], ['*', 1, 1.5]],
                        10, ['/', ['var', 'data_prop'], ['*', 0.5, 1.5]]
                    ]
                ],
                'tracts': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        8, ['/', ['var', 'data_prop'], ['*', 4, 1.5]],
                        10, ['/', ['var', 'data_prop'], ['*', 1, 1.5]],
                        12, ['/', ['var', 'data_prop'], ['*', 0.5, 1.5]]
                    ]
                ],
                'block-groups': [
                    'let', 'data_prop', ['min', 20, ['get', 'PROP']],
                    [
                        'interpolate', ['linear'], ['zoom'],
                        8, ['/', ['var', 'data_prop'], ['*', 8, 1.5]],
                        10, ['/', ['var', 'data_prop'], ['*', 2, 1.5]],
                        12, ['/', ['var', 'data_prop'], ['*', 1, 1.5]]
                    ]
                ]
            }
        }
    ]
};