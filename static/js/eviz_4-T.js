(function (eviz) {
    'use strict';

    const chartContainer = d3.select('#fourthT .target--chart');
    const boundingRect = chartContainer.node().getBoundingClientRect();
    const width = boundingRect.width;
    const height = boundingRect.height;

    const initMap = function () {
        const context = chartContainer.select('#educationMap');
        const context_r = context.node().getBoundingClientRect();
        const context_w = context_r.width;
        const context_h = context_r.height;

        const svg = context.append('svg').attr('height', context_h).attr('width', context_w);

        const colorScale = d3.scaleOrdinal().domain(['West', 'East', 'Non-EU']).range(["#deebf7", "#9ecae1", "#3182bd"]);
        const heightScale = d3.scaleLinear().domain([0, 60]).range([0, 60]);

        const map_w = context_w;
        const map_h = map_w * (eviz.data.mapData.bbox[3] - eviz.data.mapData.bbox[1]) / (eviz.data.mapData.bbox[2] - eviz.data.mapData.bbox[0]);

        const path = d3.geoPath()
            .projection(d3.geoIdentity().reflectY(true).fitSize([map_w, map_h], topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.gra)));

        const showTooltip = function (d) {
            const cD = holder.select('circle#' + d.properties.id).data()[0];

            const p = tooltip.select('p');
            const h = tooltip.select('h2').text(eviz.countries[eviz.codes.indexOf(d.properties.id)]);

            p.select('span#year').text(currentYear);
            p.select('span#val').text(cD.value).style('color', function () {
                if (cD.target != null) {
                    return cD.value >= cD.target ? 'green' : 'red';
                }
            });

            if (cD.target != null) {
                p.select('span#tar').html(', while its target was ' + cD.target + '%');
            } else {
                p.select('span#tar').html('');
            }

            tooltip.style('left', function () {
                return (path.centroid(cD.geo)[0] + 30) + 'px';
            });
            tooltip.style('top', function () {
                return (path.centroid(cD.geo)[1]) + 'px';
            });
        }

        const countries = svg.append('g').attr('class', 'countries').selectAll('path')
            .data(topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.nutsrg).features).enter().append('path').attr('d', path)
            .style('fill', function (d) {
                if (d.properties.id == 'AL') return '#f5f6fa';

                return colorScale(eviz.decideGroup(d.properties.id));
            }).attr('id', function (d) {
                return d.properties.id;
            })
            .on('mouseenter', function (d) {
                if (d.properties.id == 'AL') return;

                d3.select(this).classed('active', true);

                showTooltip(d);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('active', false);

                tooltip.style('left', '-9999px');
            });
        const boundaries = svg.append('g').attr('class', 'boundaries').selectAll('path')
            .data(topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.nutsbn).features).enter().append('path').attr('d', path)
            .style('stroke', '#666').style('stroke-opacity', .1).style('fill', 'transparent')
            .style('pointer-events', 'none');

        let currentYear = 2019;

        const sliderValues = d3.range(2015, 2020);
        const sliderTime = d3.sliderBottom().min(d3.min(sliderValues)).max(d3.max(sliderValues)).step(1).width(250).tickFormat(d3.format('d'))
            .tickValues(sliderValues).on('onchange', function (v) {
                currentYear = v;
                update(makeData());
            }).default(d3.max(sliderValues));

        const bar_w = 10;

        const shapes = {};

        (topojson.feature(eviz.data.mapData, eviz.data.mapData.objects.nutsrg).features).forEach(function (c) {
            shapes[c.properties.id] = c;
        });

        const tooltip = context.select('.target--chart--tooltip');

        const holder = svg.append('g').attr('class', 'holder');

        holder.attr('transform', 'translate(0, 75)');
        countries.attr('transform', 'translate(0, 75)');
        boundaries.attr('transform', 'translate(0, 75)');

        const makeData = function () {
            return eviz.codes.map(function (c) {
                return {
                    'code': c,
                    'value': eviz.data.europaData[c]['te_' + currentYear],
                    'target': eviz.data.europaData[c]['te_t'] != 0 ? eviz.data.europaData[c]['te_t'] : null,
                    'geo': shapes[c]
                }
            });
        }

        const makeLegend = function () {
            const legend = svg.append('g').attr('class', 'legend');
            const samples = ['DE', 'HU', 'TR'];
            const time = legend.append('g')
                .attr('transform', 'translate(30, 30)').call(sliderTime).selectAll('text').style('font-size', '1.4rem').style('font-family', 'Barlow Semi Condensed');

            for (const s of samples) {
                legend.append('circle').attr('r', 25).style('fill', colorScale(eviz.decideGroup(s)))
                    .attr('transform', 'translate(' + (context_w * 0.8 + samples.indexOf(s) * 80) + ', 40)');
                legend.append('text').text(eviz.decideGroup(s))
                    .attr('transform', 'translate(' + (context_w * 0.8 + samples.indexOf(s) * 80) + ', 40)')
                    .style('alignment-baseline', 'middle').style('text-anchor', 'middle')
                    .style('font-size', '1.2rem').attr('dy', '.1em');
            }

            legend.append('text').text('Pole height is proportional to percentage')
                .attr('transform', 'translate(' + (context_w * 0.8) + ', 90)').style('font-weight', '300');
        }

        const update = function (data) {
            const lines = holder.selectAll('.line').data(data);

            lines.enter().append('line').attr('class', 'line').attr('y2', 0)
                .merge(lines)
                .style('stroke', '#666').style('stroke-width', '2').style('stroke-opacity', .5)
                .attr('transform', function (d) {
                    return 'translate(' + path.centroid(d.geo) + ') rotate(180)';
                })
                .style('pointer-events', 'none')
                .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
                .attr('y2', function (d) {
                    return heightScale(d.value);
                });

            const circles = holder.selectAll('.circle').data(data);

            circles.enter().append('circle').attr('class', 'circle')
                .attr('id', function (d) {
                    return d.code;
                })
                .attr('cy', function (d) {
                    return path.centroid(d.geo)[1];
                })
                .merge(circles)
                .attr('r', 6)
                .style('fill', '#16a085')
                .style('stroke', '#666')
                .style('stroke-opacity', .5)
                .attr('cx', function (d) {
                    return path.centroid(d.geo)[0];
                })
                .style('pointer-events', 'none')
                .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
                .attr('cy', function (d) {
                    return path.centroid(d.geo)[1] - heightScale(d.value);
                });
        }

        makeLegend();
        update(makeData());
    }

    const initChart = function () {
        const context = chartContainer.select('#educationChart');
        const context_r = context.node().getBoundingClientRect();
        const context_w = context_r.width;
        const context_h = context_r.height;

        const innerRadius = 100;
        const outerRadius = Math.min(context_w - 100, context_h - 100) / 2;

        const svg = context.append('svg').attr('width', context_w).attr('height', context_h).append('g')
            .attr('transform', 'translate(' + context_w / 2 + ', ' + (context_h / 2 + 30) + ')');

        let currentYear = 2019;

        const makeData = function () {
            return eviz.codes.map(function (c) {
                return {
                    'key': c,
                    'country': eviz.countries[eviz.codes.indexOf(c)],
                    'value': eviz.data.europaData[c]['el_' + currentYear],
                    'target': eviz.data.europaData[c]['el_t'] != 0 ? eviz.data.europaData[c]['el_t'] : null
                }
            });
        }

        const tooltip = context.select('.target--chart--tooltip');

        const sliderValues = d3.range(2015, 2020);
        const sliderTime = d3.sliderBottom().min(d3.min(sliderValues)).max(d3.max(sliderValues)).step(1).width(250).tickFormat(d3.format('d'))
            .tickValues(sliderValues).on('onchange', function (v) {
                currentYear = v;
                update(makeData());
            }).default(d3.max(sliderValues));

        const scaleCircle = d3.scaleBand().range([0, 2 * Math.PI]).domain(makeData().map(function (d) {
            return d.country;
        }));
        const scaleHeight = d3.scaleRadial().range([innerRadius, outerRadius]).domain([0, 40]);
        const colorScale = d3.scaleOrdinal().domain(['West', 'East', 'Non-EU']).range(["#deebf7", "#9ecae1", "#3182bd"]);

        const barGroup = svg.append('g').attr('class', 'barGroup');
        const labelGroup = svg.append('g').attr('class', 'labelGroup');

        const makeLegend = function () {
            const legend = context.select('svg').append('g').attr('class', 'legend');
            const samples = ['DE', 'HU', 'TR'];
            const time = legend.append('g')
                .attr('transform', 'translate(30, 30)').call(sliderTime).selectAll('text').style('font-size', '1.4rem').style('font-family', 'Barlow Semi Condensed');

            for (const s of samples) {
                legend.append('circle').attr('r', 25).style('fill', colorScale(eviz.decideGroup(s)))
                    .attr('transform', 'translate(' + (context_w * 0.8 + samples.indexOf(s) * 80) + ', 40)');
                legend.append('text').text(eviz.decideGroup(s))
                    .attr('transform', 'translate(' + (context_w * 0.8 + samples.indexOf(s) * 80) + ', 40)')
                    .style('alignment-baseline', 'middle').style('text-anchor', 'middle')
                    .style('font-size', '1.2rem').attr('dy', '.1em');
            }

            legend.append('text').text('Bar height is proportional to percentage')
                .attr('transform', 'translate(' + (context_w * 0.8) + ', 90)').style('font-weight', '300');

            svg.append('g').attr('class', 'y-axis').attr('opacity', .5)
                .attr('text-anchor', 'middle')
                .call(function (g) {
                    g.append('text').attr('y', function () {
                        return -scaleHeight(scaleHeight.ticks(5).pop());
                    })
                    .attr('dy', '-1em')
                    .text('Rate of early leavers')
                    .style('font-weight', 300);
                })
                .call(function (g) {
                    g.selectAll('g').data(scaleHeight.ticks(5).slice(1)).enter()
                        .append('g').attr('fill', 'none')
                        .call(function (g) {
                            g.append('circle')
                                .attr('stroke', '#000')
                                .attr('stroke-opacity', .5)
                                .attr('r', scaleHeight)
                        })
                        .call(function (g) {
                            g.append('text')
                                .attr('y', function (d) {
                                    return -scaleHeight(d);
                                })
                                .attr('dy', '0.35em')
                                .text(function (d) {
                                    return d + '%';
                                })
                                .style('font-weight', 300)
                                .clone(true)
                                    .attr('fill', '#000')
                                    .attr('stroke', 'none')
                        });
                })
        }

        const arc = d3.arc().innerRadius(innerRadius).outerRadius(function (d) {
                            return scaleHeight(d.value);
                        }).startAngle(function (d) {
                            return scaleCircle(d.country)
                        }).endAngle(function (d) {
                            return scaleCircle(d.country) + scaleCircle.bandwidth();
                        }).padAngle(.1).padRadius(innerRadius);

        const update = function () {
            const data = makeData();

            const bars = barGroup.selectAll('.bar').data(data);

            bars.enter().append('path').attr('class', 'bar')
                .attr('fill', function (d) {
                    return colorScale(eviz.decideGroup(d.key));
                })
                .merge(bars)
                .on('mouseenter', function (d) {
                    d3.select(this).classed('active', true);

                    const p = tooltip.select('p').text(d.value + '%');

                    const mouseCoords = d3.mouse(context.node());
                    const w = parseInt(tooltip.style('width'));
                    const h = parseInt(tooltip.style('height'));

                    tooltip.style('left', (mouseCoords[0] - w / 2) + 'px');
                    tooltip.style('top', (mouseCoords[1] + h) + 'px');
                })
                .on('mouseout', function (d) {
                    d3.select(this).classed('active', false);

                    tooltip.style('left', '-9999px');
                })
                .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
                .attr('d', arc);

            const labels = labelGroup.selectAll('.label').data(data)

            labels.enter().append('text').attr('class', 'label')
                .attr('text-anchor', function (d) {
                    return (scaleCircle(d.country) + scaleCircle.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
                }).merge(labels)
                .transition().duration(eviz.TRANS_DURATION).delay(eviz.TRANS_DURATION / 2)
                .attr('transform', function (d) {
                    const temp = ((scaleCircle(d.country) + scaleCircle.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI) ? ("rotate(" + (((scaleCircle(d.country) + scaleCircle.bandwidth() / 2) * 180 / Math.PI - 90) + 180) + ")" + "translate(-" + (scaleHeight(d.value) + 10) + ",0)") : ("rotate(" + ((scaleCircle(d.country) + scaleCircle.bandwidth() / 2) * 180 / Math.PI - 90) + ")") + "translate(" + (scaleHeight(d.value) + 10) + ",0)";

                    return temp;
                })
                .style('font-size', '1.2rem')
                .attr('alignment-baseline', 'middle')
                .text(function (d) {
                    return d.country;
                }).style('pointer-events', 'none');
        }

        update();
        makeLegend();
    }

    eviz.initFourth = function () {
        initMap();
        initChart();
    }

}(window.eviz = window.eviz || {}));