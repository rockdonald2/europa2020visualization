(function (eviz) {
    'use strict';

    /* 
     * egy oszlopdiagramhoz hasonló vonaldiagram, körökkel, ahol az y-tengely az országnevek lesznek, az ábra tetején elhelyezkedő x-tengelyen
     * pedig százalékok, a min 45%, a max pedig 90% lesz
     * a körökbe bele lesz írva az év
     */

    /* alapvető változók */
    const chartContainer = d3.select('#firstT .target--chart');
    const boundingRect = chartContainer.node().getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;
    const svg = chartContainer.append('svg').attr('width', width).attr('height', height);

    const yValues = d3.range(1, 36).map(function (d) {
        return d * 45;
    });
    const xValues = d3.range(50, 100, 10);

    const years = [2015, 2016, 2017, 2018, 'target'];

    const scaleY = d3.scaleOrdinal().domain(d3.range(35)).range(yValues);
    const scaleX = d3.scaleLinear().domain([50, 90]).range([0, width - 150]);
    const colorScale = d3.scaleOrdinal().domain(years.slice(0, years.length - 1)).range(['rgb(198, 219, 239)', 'rgb(107, 174, 214)', 'rgb(33, 113, 181)', 'rgb(8, 48, 107)']);

    const radius = 15;

    const tooltip = d3.select('#firstT .target--chart--tooltip');

    const makeAxis = function () {
        const x = svg.append('g').attr('class', 'x-axis').attr('transform', 'translate(120, 60)');

        for (const v of xValues) {
            const tick = x.append('g').attr('class', 'tick').attr('transform', 'translate(' + scaleX(v) + ', 0)');
            tick.append('text').text(v + '%').style('font-size', '1.4rem').style('text-anchor', 'middle');
            tick.append('line').attr('y1', 30).attr('y2', scaleY(34) + 20).attr('stroke', '#222').attr('stroke-dasharray', '.5rem');
        }

        const y = svg.append('g').attr('class', 'y-axis').attr('transform', 'translate(0, 60)');
        for (const c of eviz.codes) {
            const tick = y.append('g').attr('id', c).attr('class', 'tick').attr('transform', 'translate(0,' + scaleY(eviz.codes.indexOf(c)) + ')');
            tick.append('text').text(eviz.countries[eviz.codes.indexOf(c)]).style('font-size', '1.4rem').style('text-align', 'center');
        }
    };

    const makeLegend = function () {
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

        const legend = svg.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width * 0.4) + ', 25)');

        const ticks = legend.selectAll('.tick').data(data);
        const g = ticks.enter().append('g').attr('class', 'tick').attr('transform', function (d, i) {
            return 'translate(' + i * 100 + ', 0)';
        });
        g.append('circle').attr('r', radius / 2).style('fill', function (d, i) {
            if (d.value == 'Target') return eviz.targetColor;

            return colorScale(d.value);
        }).style('opacity', 0.7);
        g.append('text').text(function (d) {
            return d.value;
        }).style('alignment-baseline', 'middle').style('text-anchor', 'start').attr('dx', '.9em').style('font-size', '1.4rem');

        const line = legend.append('g').attr('class', 'tick').attr('transform', 'translate(500, 0)');
        line.append('line').attr('x1', 0).attr('x2', 15).attr('stroke', '#222');
        line.append('text').text('Progress').style('alignment-baseline', 'middle').style('text-anchor', 'start').attr('dx', '1.5em').style('font-size', '1.4rem');
    }

    const showTooltip = function (d, i) {
        const p = tooltip.select('.target--chart--tooltip__p');

        for (const y of years) {
            p.select('#v_' + y).text(d[y] + '%');
        }

        let difference = -10;
        if (d['target'] != null) {
            p.select('p:nth-of-type(5)').style('display', 'flex');
        } else {
            p.select('p:nth-of-type(5)').style('display', 'none');
            difference = -20;
        }

        tooltip.style('left', '110px');
        tooltip.style('top', (scaleY(i) - difference) + 'px')
    };

    eviz.initFirst = function () {
        makeAxis();
        makeLegend();

        const data = eviz.codes.map(function (c) {
            return {
                'code': c,
                '2015': eviz.data.europaData[c]['e_2015'],
                '2016': eviz.data.europaData[c]['e_2016'],
                '2017': eviz.data.europaData[c]['e_2017'],
                '2018': eviz.data.europaData[c]['e_2018'],
                'target': eviz.data.europaData[c]['e_t'],
            }
        });

        const countries = svg.append('g').attr('class', 'countries').selectAll('.circleGroup').data(data);

        const g = countries.enter().append('g').attr('id', function (d) {
            return d.code;
        }).attr('transform', function (d, i) {
            return 'translate(120, ' + (scaleY(i) + 55) + ')';
        });

        for (const y of years) {
            g.append('circle').attr('id', function (d) {
                if (y == 2015) return d.code + '_first';
            }).attr('r', radius).attr('cx', 0).on('mouseenter', function (d, i) {
                showTooltip(d, i);
            }).on('mouseout', function (d) {
                tooltip.style('left', '-9999px');
            }).style('fill', function (d) {
                if (y == 'target') return eviz.targetColor;

                return colorScale(y);
            }).style('opacity', 0.7).transition().duration(eviz.TRANS_DURATION).attr('cx', function (d) {
                return scaleX(d[y]);
            });
        }

        g.insert('line', function (d) {
            return d3.select('#' + d.code + '_first').node();
        }).transition().duration(eviz.TRANS_DURATION).attr('x1', 0).attr('x2', 0).attr('x1', function (d) {
            let min = 100;
            for (const y of years) {
                if (y == 'target') continue;

                if (d[y] < min) min = d[y];
            }

            return scaleX(min);
        }).attr('x2', function (d) {
            let max = 0;
            for (const y of years) {
                if (y == 'target') continue;

                if (d[y] > max) max = d[y];
            }

            return scaleX(max);
        }).style('stroke', '#222').style('pointer-events', 'none');
    };
}(window.eviz = window.eviz || {}));