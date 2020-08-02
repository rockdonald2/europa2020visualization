(function (eviz) {
    'use strict';

    const chartContainer = d3.select('#secondT .target--chart');
    const boundingRect = chartContainer.node().getBoundingClientRect();
    const height = boundingRect.height;
    const width = boundingRect.width;
    const svg = chartContainer.append('svg').attr('height', height).attr('width', width);

    const yValues = d3.range(1, 36).map(function (d) {
        return d * 60;
    });
    const scaleX = d3.scaleLinear().domain([0, 4]).range([0, width - 150]);
    const scaleY = d3.scaleOrdinal().domain(d3.range(35)).range(yValues);
    const colorScale = d3.scaleOrdinal().domain(d3.range(2015, 2019)).range(['rgb(198, 219, 239)', 'rgb(107, 174, 214)', 'rgb(33, 113, 181)', 'rgb(8, 48, 107)']);

    const bar_w = 9;

    const tooltip = chartContainer.select('.target--chart--tooltip');

    const makeAxis = function () {
        const x = svg.append('g').attr('class', 'x-axis').attr('transform', 'translate(120, 60)');
        for (let i = 0; i < 4.5; i += 0.5) {
            const tick = x.append('g').attr('class', 'tick')
                .attr('transform', 'translate(' + scaleX(i) + ', 0)');
            tick.append('text').text(i + '%').style('font-size', '1.4rem')
                .style('text-anchor', 'middle');
            tick.append('line').attr('y1', 15).attr('y2', scaleY(34) + 20)
                .attr('stroke', '#222').attr('stroke-dasharray', '.5rem');
        }

        const y = svg.append('g').attr('class', 'y-axis')
            .attr('transform', 'translate(0, 60)');
        for (const c of eviz.codes) {
            const tick = y.append('g').attr('class', 'tick')
                .attr('transform', 'translate(0,' + scaleY(eviz.codes.indexOf(c)) + ')');
            tick.append('text').text(eviz.countries[eviz.codes.indexOf(c)])
                .style('font-size', '1.4rem').style('text-align', 'center');
        }
    }

    const makeLegend = function () {
        const legend = svg.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width * 0.5) + ', 25)');

        const data = [{
            'value': 2015
        }, {
            'value': 2016
        }, {
            'value': 2017
        }, {
            'value': 2018
        }, {
            'value': 'Target'
        }];

        const ticks = legend.selectAll('.tick').data(data);

        const g = ticks.enter().append('g').attr('class', 'tick').attr('transform', function (d, i) {
            return 'translate(' + i * 100 + ', 0)';
        });

        g.append('rect').attr('width', 30).attr('height', 10).style('fill', function (d) {
            if (d.value == 'Target') return eviz.targetColor;

            return colorScale(d.value);
        }).attr('y', -5);

        g.append('text').text(function (d) {
                return d.value;
            }).style('alignment-baseline', 'middle').style('text-anchor', 'start')
            .attr('dx', '3em').style('font-size', '1.4rem');
    }

    eviz.initSecond = function () {
        makeAxis();
        makeLegend();

        const data = eviz.codes.map(function (c) {
            return {
                'code': c,
                '2015': eviz.data.europaData[c]['rd_2015'],
                '2016': eviz.data.europaData[c]['rd_2016'],
                '2017': eviz.data.europaData[c]['rd_2017'],
                '2018': eviz.data.europaData[c]['rd_2018'],
                'target': eviz.data.europaData[c]['rd_t']
            };
        });
        const years = [2015, 2016, 2017, 2018, 'target'];

        const countries = svg.append('g').attr('class', 'countries').attr('transform', 'translate(0, 28)').selectAll('.barGroup').data(data);

        const g = countries.enter().append('g').attr('id', function (d) {
            return d.code;
        }).attr('transform', function (d, i) {
            return 'translate(120,' + scaleY(i) + ')';
        });

        for (const y of years) {
            g.append('rect').attr('height', bar_w).attr('width', 0).on('mouseenter', function (d) {
                    d3.select(this).attr('class', 'active');

                    tooltip.select('p').text(function () {
                        return d[y] + '%';
                    });

                    tooltip.style('left', function () {
                        return (scaleX(d[y]) + 130) + 'px';
                    });
                    tooltip.style('top', function () {
                        return (scaleY(eviz.codes.indexOf(d['code'])) + years.indexOf(y) * 11 + 38) + 'px';
                    });
                }).on('mouseout', function (d) {
                    d3.select(this).attr('class', '');

                    tooltip.style('left', '-9999px');
                }).attr('transform', function (d, i) {
                    return 'translate(0,' + (years.indexOf(y) * 11) + ')'
                })
                .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
                .attr('width', function (d) {
                    return scaleX(d[y]);
                }).attr('fill', function (d) {
                    if (y == 'target') return eviz.targetColor;

                    return colorScale(y);
                }).attr('rx', 5);
        }
    }

}(window.eviz = window.eviz || {}));