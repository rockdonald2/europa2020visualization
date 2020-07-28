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
    const xValues = [45, 60, 75, 90];

    const scaleY = d3.scaleOrdinal().domain(d3.range(35)).range(yValues);
    const scaleX = d3.scaleLinear().domain([45, 90]).range([0, width - 150]);
    const colorScale = d3.scaleOrdinal().domain([2015, 2016, 2017, 2018]).range(['rgb(198, 219, 239)', 'rgb(107, 174, 214)', 'rgb(33, 113, 181)', 'rgb(8, 48, 107)']);

    const radius = 15;
    
    const tooltip = d3.select('#firstT .target--chart--tooltip');

    const makeAxis = function () {
        const x = svg.append('g').attr('class', 'x-axis').attr('transform', 'translate(120, 60)');
        for (let i = 1; i < 5; i++) {
            const tick = x.append('g').attr('class', 'tick').attr('transform', 'translate(' + scaleX(xValues[i - 1]) + ', 0)');
            tick.append('text').text(xValues[i - 1] + '%').style('font-size', '1.4rem').style('text-anchor', 'middle');
            tick.append('line').attr('y1', 30).attr('y2', scaleY(34) + 20).attr('stroke', '#222').attr('stroke-dasharray', '.5rem');
        }

        const y = svg.append('g').attr('class', 'y-axis').attr('transform', 'translate(0, 60)');
        for (const c of eviz.codes) {
            const tick = y.append('g').attr('id', c).attr('class', 'tick').attr('transform', 'translate(0,' + scaleY(eviz.codes.indexOf(c)) + ')');
            tick.append('text').text(eviz.countries[eviz.codes.indexOf(c)]).style('font-size', '1.4rem').style('text-align', 'center');
        }
    };

    const makeLegend = function () {
        const legend = svg.append('g').attr('class', 'legend').attr('transform', 'translate(' + (width * 0.4) + ', 25)');

        for (let i = 0; i < 4; i++) {
            const curr = legend.append('g').attr('class', 'tick').attr('transform', 'translate(' + i * 100 + ', 0)');
            curr.append('circle').attr('r', radius / 2).style('fill', colorScale(i + 2015)).style('opacity', 0.7);
            curr.append('text').text(i + 2015).style('alignment-baseline', 'middle').style('text-anchor', 'start').attr('dx', '.9em').style('font-size', '1.4rem');
        }

        const target = legend.append('g').attr('class', 'tick').attr('transform', 'translate(400, 0)');
        target.append('circle').attr('r', radius / 2).style('fill', 'green').style('opacity', 0.7);
        target.append('text').text('Target').style('alignment-baseline', 'middle').style('text-anchor', 'start').attr('dx', '.9em').style('font-size', '1.4rem');

        const line = legend.append('g').attr('class', 'tick').attr('transform', 'translate(500, 0)');
        line.append('line').attr('x1', 0).attr('x2', 15).attr('stroke', '#222');
        line.append('text').text('Progress').style('alignment-baseline', 'middle').style('text-anchor', 'start').attr('dx', '1.5em').style('font-size', '1.4rem');
    }

    const showTooltip = function (c) {
        const p = tooltip.select('.target--chart--tooltip__p');

        const current = eviz.data.europaData[c];

        p.select('#v_2015').text(current['e_2015'] + '%');
        p.select('#v_2016').text(current['e_2016'] + '%');
        p.select('#v_2017').text(current['e_2017'] + '%');
        p.select('#v_2018').text(current['e_2018'] + '%');
        p.select('#v_target').text(current['e_t'] + '%')

        let difference = -15;
        if (current['e_t'] != null) {
            p.select('p:nth-of-type(5)').style('display', 'flex');
        } else {
            p.select('p:nth-of-type(5)').style('display', 'none');
            difference = -30;
        }

        tooltip.style('left', '100px');
        tooltip.style('top', (scaleY(eviz.codes.indexOf(c)) - difference) + 'px')
    };

    eviz.initFirst = function () {
        makeAxis();
        makeLegend();

        const countries = svg.append('g').attr('class', 'countries');

        for (const c of eviz.codes) {
            const curr = countries.append('g').attr('id', c).attr('transform', 'translate(120,' + (scaleY(eviz.codes.indexOf(c)) + 55) + ')');

            let lowest = 100;
            let highest = 0;

            for (let i = 2015; i < 2019; i++) {
                const value = eviz.data.europaData[c]['e_' + i];
                let currCircle;

                if (i == 2015) {
                    currCircle = curr.append('circle').attr('id', c + '_first');
                } else {
                    currCircle = curr.append('circle');
                }

                currCircle.attr('r', radius).attr('cx', scaleX(value)).style('fill', colorScale(i)).style('opacity', '0.7').on('mouseenter', function () {
                    showTooltip(c);
                }).on('mouseout', function (d) {
                    tooltip.style('left', '-9999px');
                });

                if (value > highest) {
                    highest = value;
                }

                if (value < lowest) {
                    lowest = value;
                }
            }

            curr.append('circle').attr('r', radius).attr('cx', scaleX(eviz.data.europaData[c]['e_t'])).style('fill', 'green').style('opacity', '0.7')
                .on('mouseenter', function () {
                    showTooltip(c);
                }).on('mouseout', function (d) {
                    tooltip.style('left', '-9999px');
                });
            curr.insert('line', '#' + c + '_first').attr('x1', scaleX(lowest)).attr('x2', scaleX(highest)).style('stroke', '#222').style('pointer-events', 'none');
        }
    };
}(window.eviz = window.eviz || {}));