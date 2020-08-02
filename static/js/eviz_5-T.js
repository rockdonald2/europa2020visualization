(function (eviz) {
    'use strict';

    const chartContainer = d3.select('#fifthT .target--chart');
    const boundingRect = chartContainer.node().getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;

    const svg = chartContainer.append('svg').attr('width', width).attr('height', height);

    let currentYear = 2018;

    const tooltip = chartContainer.select('.target--chart--tooltip');

    const makeData = function () {
        return eviz.codes.map(function (c) {
            return {
                code: c,
                value: eviz.data.europaData[c]['sx_' + currentYear],
                target: eviz.data.europaData[c]['sx_t']
            }
        })
    }

    const makeAxis = function (scaleX, scaleY) {
        const x = svg.append('g').attr('class', 'x-axis').attr('transform', 'translate(' + width / 2 + ', 30)')
            .call(function (g) {
                g.selectAll('g').data(scaleX.ticks(7)).enter()
                    .append('g').attr('transform', 'translate(0, 75)')
                    .call(function (g) {
                        g.append('text').text(function (d) {
                            return d3.format('.2s')(d);
                        }).style('text-anchor', 'middle').attr('transform', function (d) {
                            return 'translate(' + scaleX(d) + ', 0)';
                        });
                    })
                    .call(function (g) {
                        g.append('line').attr('x1', function (d) {
                            return scaleX(d);
                        }).attr('x2', function (d) {
                            return scaleX(d);
                        }).attr('y1', 20).attr('y2', height - 125).style('stroke', '#666').style('stroke-dasharray', function (d) {
                            if (d == 0) return 0;
                            else return '.5rem';
                        });
                    })
            });
    }

    const makeLegend = function (scaleX, scaleY) {
        const sliderValues = d3.range(2015, 2020);
        const sliderTime = d3.sliderBottom().min(d3.min(sliderValues)).max(d3.max(sliderValues)).step(1).width(250).tickFormat(d3.format('d'))
            .tickValues(sliderValues).on('onchange', function (v) {
                currentYear = v;
                update(makeData(), scaleX, scaleY);
            }).default(sliderValues[sliderValues.length - 2]);

        const legend = svg.append('g').attr('class', 'legend').attr('transform', 'translate(70, 25)');
        const time = legend.append('g')
            .attr('transform', 'translate(5, 10)').call(sliderTime).selectAll('text').style('font-size', '1.4rem').style('font-family', 'Barlow Semi Condensed');
        const text = legend.append('text')
            .text('Cumulative difference from 2008, in thousands').attr('transform', 'translate(' + (width * 0.65) + ', 30)').style('font-size', '1.2rem');
        const increased = legend.append('g').attr('transform', 'translate(' + (width * 0.35) + (', 25)'))
            .call(function (g) {
                g.append('rect')
                    .style('fill', d3.schemeSet1[0]).attr('width', 15).attr('height', 5)
            })
            .call(function (g) {
                g.append('text').text('Increased').style('alignment-baseline', 'middle').attr('dy', '.2em').attr('transform', 'translate(20, 0)');
            }).style('font-size', '1.2rem');
        const decreased = legend.append('g').attr('transform', 'translate(' + (width * 0.45) + (', 25)'))
            .call(function (g) {
                g.append('rect')
                    .style('fill', d3.schemeSet1[1]).attr('width', 15).attr('height', 5)
            })
            .call(function (g) {
                g.append('text').text('Decreased').style('alignment-baseline', 'middle').attr('dy', '.2em').attr('transform', 'translate(20, 0)');
            }).style('font-size', '1.2rem');
        const nodata = legend.append('g').attr('transform', 'translate(' + (width * 0.55) + (', 25)'))
            .call(function (g) {
                g.append('text').text('No data').style('alignment-baseline', 'middle').attr('dy', '.2em');
            }).attr('fill', '#666').style('font-size', '1.2rem');
    }

    const update = function (data, scaleX, scaleY) {
        const bars = svg.selectAll('.bar').data(data);

        bars.enter().append('rect')
            .attr('class', 'bar')
            .attr('y', function (d) {
                return scaleY(d.code) + 65;
            })
            .attr('x', 500)
            .attr('fill', '#fff')
            .merge(bars)
            .on('mouseenter', function (d) {
                const p = tooltip.select('p').text(d3.format('.2s')(d.value));

                const mouseCoords = d3.mouse(chartContainer.node());

                tooltip.style('left', (mouseCoords[0] + 10) + 'px');
                tooltip.style('top', (mouseCoords[1] + 10) + 'px');
            })
            .on('mouseout', function (d) {
                tooltip.style('left', '-9999px');
            })
            .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
            .attr('width', 0)
            .style('fill', function (d) {
                return d3.schemeSet1[d.value < 0 ? 1 : 0];
            })
            .attr('x', function (d) {
                if (d.value > 0) {
                    return 500;
                } else if (d.value < 0) {
                    return 500 + scaleX(d.value);
                } else {
                    return 500;
                }
            })
            .attr('width', function (d) {
                return Math.abs(scaleX(d.value));
            }).attr('height', 20).attr('rx', 5);

        const labels = svg.selectAll('.label').data(data);

        labels.enter().append('text')
            .attr('class', 'label')
            .style('font-size', '1.2rem')
            .style('pointer-events', 'none')
            .style('alignment-baseline', 'center')
            .attr('dy', '-.1em')
            .attr('transform', function (d) {
                return 'translate(' + width / 2 + ', ' + (scaleY(d.code) + 80) + ')';
            })
            .merge(labels)
            .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
            .attr('dx', function (d) {
                if (d.value == null) return '0';

                if (d.value > 0) return '.5em';
                else return '-.5em';
            })
            .style('fill', function (d) {
                if (d.value == null) {
                    return '#666';
                }

                return '#000';
            })
            .attr('transform', function (d) {
                return 'translate(' + (500 + scaleX(d.value)) + ', ' + (scaleY(d.code) + 80) + ')';
            })
            .text(function (d) {
                return eviz.countries[eviz.codes.indexOf(d.code)];
            })
            .style('text-anchor', function (d) {
                if (d.value == null) {
                    return 'middle';
                }

                if (d.value > 0) return 'start';
                else return 'end';
            });
    }

    eviz.initFifth = function () {
        const min = d3.min(makeData(), function (d) {
            return +d.value;
        });
        const scaleX = d3.scaleLinear().domain([min, -min]).range([min / 11000, -min / 11000]);
        const scaleY = d3.scaleOrdinal().domain(eviz.codes).range(d3.range(70, height, 30));

        makeLegend(scaleX, scaleY);
        makeAxis(scaleX, scaleY);

        update(makeData(), scaleX, scaleY);
    }
}(window.eviz = window.eviz || {}));