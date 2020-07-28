(function (eviz) {
    'use strict';

    d3.queue()
        .defer(d3.json, 'static/data/europa-data.json')
        .defer(d3.json, 'static/data/map-data.json')
        .defer(d3.json, 'static/data/map-points.json')
        .await(ready);

    function ready (error, europaData, mapData, mapPoints) {
        if (error) {
            return console.warn(error);
        }

        eviz.data.europaData = europaData;
        eviz.data.mapData = mapData;
        eviz.data.mapPoints = mapPoints;

        eviz.init();
    }

} (window.eviz = window.eviz || {}));
