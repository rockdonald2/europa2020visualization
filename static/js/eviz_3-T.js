(function (eviz) {
    'use strict';

    const chartContainer = d3.select('#thirdT .target--chart')
    const boundingRect = chartContainer.node().getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;

    let path = null;

    const initMap = function () {
        const context = chartContainer.select('#climateMap');
        const context_r = context.node().getBoundingClientRect();
        const context_w = context_r.width;
        const context_h = context_r.width * (eviz.data.mapData.bbox[3] - eviz.data.mapData.bbox[1]) / (eviz.data.mapData.bbox[2] - eviz.data.mapData.bbox[0]);

        const svg = context.append('svg').attr('width', context_w).attr('height', context_h);

        path = d3.geoPath().projection(d3.geoIdentity().reflectY(true).fitSize([context_w, context_h], topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.gra)));

        const colors = [
            "#b8d6be", "#90b2b3", "#567994",
            "#73ae80", "#5a9178", "#2a5a5b",
            "#e8e8e8", "#b5c0da", "#6c83b5"
        ]
        const n = Math.floor(Math.sqrt(colors.length));

        const colorX = d3.scaleQuantile().range(d3.range(n));
        const colorY = d3.scaleQuantile().range(d3.range(n));

        const color = function (v) {
            if (!v) return '#aaa';

            let [a, b] = v;

            return colors[colorY(b) + colorX(a) * n];
        }

        const tooltip = context.select('.target--chart--tooltip');

        let currentYear = 2018;

        const countries = svg.append('g').attr('transform', 'translate(0, 30)').attr('class', 'countries').selectAll('path')
            .data(topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.nutsrg).features).enter().append('path').attr('id', function (d) {
                return d.properties.id;
            }).attr('d', path).style('fill', '#fff');

        const makeLegend = function () {
            const legend = svg.append('g').attr('class', 'legend').attr('transform', 'translate(' + width * 0.9 + ', 300)');
            const g = legend.append('g').attr('class', 'rotated').attr('transform', 'translate(-36,-36)');

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    g.append('rect').attr('height', 24).attr('width', 24).attr('x', i * 24).attr('y', j * 24).style('fill', colors[j * n + i]);
                }
            }

            g.append('marker').attr('id', 'marker').attr('markerHeight', 10).attr('markerWidth', 10).attr('refX', 6).attr('refY', 3).attr('orient', 'auto')
                .append('path').attr('d', 'M0,0L9,3L0,6Z');
            g.append('line').attr('marker-end', 'url(/#marker)').attr('x1', 0).attr('x2', 72).attr('y1', 72).attr('y2', 72).style('stroke', '#000').style('stroke-width', 1.5);
            g.append('line').attr('marker-end', 'url(/#marker)').attr('y2', 0).attr('y1', 72).style('stroke', '#000').style('stroke-width', 1.5);
            g.append('text').text('Smaller emission').attr('dy', '.71em').attr('transform', 'rotate(-90) translate(-37, -15)').style('text-anchor', 'middle');
            g.append('text').text('Renewable energy').attr('dy', '.71em').attr('transform', 'translate(36, 78)').style('text-anchor', 'middle');
        };

        makeLegend();

        const updateFirst = function () {
            const data = eviz.codes.map(function (c) {
                return {
                    'code': c,
                    'value_ge': eviz.data.europaData[c]['ge_' + currentYear],
                    'target_ge': eviz.data.europaData[c]['ge_t'],
                    'value_re': eviz.data.europaData[c]['re_' + currentYear],
                    'target_re': eviz.data.europaData[c]['re_t']
                }
            });

            colorX.domain(data.map(function (d) {
                return d.value_ge;
            }));
            colorY.domain(data.map(function (d) {
                return d.value_re;
            }));

            countries.on('mouseenter', function (d) {
                    if (d.properties.id == 'AL') return;

                    let val_ge = data[eviz.codes.indexOf(d.properties.id)].value_ge;
                    let tar_ge = data[eviz.codes.indexOf(d.properties.id)].target_ge;
                    let val_re = data[eviz.codes.indexOf(d.properties.id)].value_re;
                    let tar_re = data[eviz.codes.indexOf(d.properties.id)].target_re;

                    if (tar_ge == null) {
                        tar_ge = 'None';
                    }

                    if (tar_re == null) {
                        tar_re = 'None';
                    }

                    if (val_ge == null) {
                        val_ge = 'Not available';
                    }

                    if (val_re == null) {
                        val_re = 'Not available';
                    }

                    const header = tooltip.select('h2');
                    header.text(eviz.countries[eviz.codes.indexOf(d.properties.id)]);

                    const p = tooltip.selectAll('div');

                    p.select('p#val_ge').style('color', function () {
                        if (val_ge == 'Not available') return '#aaa';

                        return val_ge > 0 ? 'red' : 'green';
                    }).html((val_ge != 'Not available' ? (val_ge > 0 ? '&uarr;' : '&darr;') : '') + ' ' + val_ge + (val_ge != 'Not available' ? '%' : ''));
                    p.select('p#val_re').style('color', function () {
                        if (val_re == 'Not available') return '#aaa';
                        if (tar_re == 'None') return val_re > 20 ? 'green' : 'red';

                        return val_re > tar_re ? 'green' : 'red';
                    }).html(val_re + (val_re != 'Not available' ? '%' : ''));

                    p.select('p#tar_ge').style('color', function () {
                        if (tar_ge == 'None') return '#aaa';

                        return tar_ge > 0 ? 'red' : 'green';
                    }).html((tar_ge != 'None' ? (tar_ge > 0 ? '&uarr;' : '&darr;') : '') + ' ' + tar_ge + (tar_ge != 'None' ? '%' : ''));
                    p.select('p#tar_re').style('color', function () {
                        if (tar_re == 'None') return '#aaa';

                        return tar_re > 20 ? 'green' : 'red';
                    }).html(tar_re + (tar_re != 'None' ? '%' : ''))

                    const coords = path.centroid(d);
                    const w = parseInt(tooltip.style('width'));
                    const h = parseInt(tooltip.style('height'));
                    tooltip.style('left', (coords[0] - w / 1.8) + 'px');
                    tooltip.style('top', (coords[1] - h * 1.05) + 'px');
                }).on('mouseout', function () {
                    tooltip.style('left', '-9999px');
                })
                .transition().duration(eviz.TRANS_DURATION).style('fill', function (d) {
                    if (eviz.data.europaData.hasOwnProperty(d.properties.id)) {
                        const val_ge = data[eviz.codes.indexOf(d.properties.id)].value_ge;
                        const val_re = data[eviz.codes.indexOf(d.properties.id)].value_re;

                        return color([val_ge, val_re]);
                    }

                    return '#aaa';
                });
        }

        const sliderValues = d3.range(2015, 2019);
        const sliderTime = d3.sliderBottom().min(d3.min(sliderValues)).max(d3.max(sliderValues)).step(1).width(200).tickFormat(d3.format('d'))
            .tickValues(sliderValues).on('onchange', function (v) {
                currentYear = v;
                updateFirst();
            }).default(d3.max(sliderValues));
        const gTime = d3.select('#sliderTime').append('svg').attr('width', 250).attr('height', 100).append('g')
            .attr('transform', 'translate(20, 30)').call(sliderTime).selectAll('text').style('font-size', '1.4rem');

        updateFirst();
    }

    const initCharts = function () {

    }

    eviz.initThird = function () {
        initMap();
        initCharts();
    };

}(window.eviz = window.eviz || {}));