const widgetId                         = 'vizcontainer', // Must match the ID in index.jade
    widgetWidth = 900, widgetHeight = 900, // Default width and height
    personImageUrl                   = '', // Can be blank
    language                         = 'en'; // language selection

// Jquery variables
const $content  = $('.content');

function run() {
    $('#btn').click(e => {
        e.preventDefault();
        const $input = $('input').val();
        const $proxy = 'https://galvanize-twitter-proxy.herokuapp.com/';
        $.ajax({
            url: $proxy + 'statuses/user_timeline.json?count=200&screen_name=' + $input,
            type: 'GET',
            dataType: 'json',
            success: data => {
                for (let i in data) {
                    let results_text = data[i].text;
                    $content.append(results_text);
                    console.log(data.length);
                }
                updateWordCount();
            }
        });
        $('#bg').slideUp();
        $('#hidden-page').removeClass('hidden');

    });

    $('#analysis-btn').click( e => {
        e.preventDefault();
        $('#gif').removeClass('hide');

        let data = {
            contentItems: [{
                content: $content.val()
            }]
        };
        $.ajax({
            data: JSON.stringify(data),
            type: 'POST',
            url: 'https://galvanize-cors-proxy.herokuapp.com/https://watson-api-explorer.mybluemix.net/personality-insights/api/v2/profile?raw_scores=false&csv_headers=false&consumption_preferences=false&version=2016-10-20',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            headers: {'Content-Language': 'en'},
            success: function (response) {
                if (response.error) {
                    showError(response.error);
                } else {
                    console.log(response);
                    showVisualization(response);
                    $('#gif').addClass('hide');
                    $('#hidden-graph').removeClass('hidden');
                }
            },
            error: xhr => {
            	console.log(xhr);
            }

        });
    });

    function showVisualization(theProfile) {
        $('#' + widgetId).empty();
        const d3vis   = d3.select('#' + widgetId)
                .append('svg:svg'),
            tooltip = {
                element: d3.select('body')
                    .append('div')
                    .classed('tooltip', true),
                target: undefined
            };
        const widget = {
            d3vis: d3vis,
            tooltip: tooltip,
            data: theProfile,
            loadingDiv: 'dummy',
            switchState: function () {
                console.log('[switchState]');
            },
            _layout: function () {
                console.log('[_layout]');
            },
            showTooltip: function (d, context, d3event) {
                if (d.id) {
                    this.tooltip.target = d3event.currentTarget;
                    console.debug('[showTooltip]');
                    const tooltip     = demo.getTooltip(d.id.replace('_parent', '')),
                        tooltipText = d.name + ' (' + d.category + '): ' + tooltip.msg;
                    console.debug(tooltipText);
                    this.tooltip.element
                        .text(tooltipText)
                        .classed('in', true);
                }

                d3event.stopPropagation();
            },
            updateTooltipPosition: d3event => {
                this.tooltip.element
                    .style('top', (d3event.pageY - 16) + 'px')
                    .style('left', (d3event.pageX - 16) + 'px');
                d3event.stopPropagation();
            },
            hideTooltip: () => {
                console.debug('[hideTooltip]');
                this.tooltip.element
                    .classed('in', false)
                ;
            },
            id: 'SystemUWidget',
            COLOR_PALLETTE: ['#1b6ba2', '#488436', '#d52829', '#F53B0C', '#972a6b', '#8c564b', '#dddddd'],
            expandAll: () => {
                this.vis.selectAll('g').each(() => {
                    var g = d3.select(this);
                    if (g.datum().parent && // Isn't the root g object.
                        g.datum().parent.parent && // Isn't the feature trait.
                        g.datum().parent.parent.parent) { // Isn't the feature dominant trait.
                        g.attr('visibility', 'visible');
                    }
                });
            },
            collapseAll: () => {
                this.vis.selectAll('g').each(() => {
                    var g = d3.select(this);
                    if (g.datum().parent !== null && // Isn't the root g object.
                        g.datum().parent.parent !== null && // Isn't the feature trait.
                        g.datum().parent.parent.parent !== null) { // Isn't the feature dominant trait.
                        g.attr('visibility', 'hidden');
                    }
                });
            },
            addPersonImage: url => {
                if (!this.vis || !url) {
                    return;
                }
                var icon_defs = this.vis.append('defs');
                var width  = this.dimW,
                    height = this.dimH;

                // The flower had a radius of 640 / 1.9 = 336.84 in the original, now is 3.2.
                var radius = Math.min(width, height) / 16.58; // For 640 / 1.9 -> r = 65
                var scaled_w = radius * 2.46; // r = 65 -> w = 160

                var id = 'user_icon_' + this.id;
                icon_defs.append('pattern')
                    .attr('id', id)
                    .attr('height', 1)
                    .attr('width', 1)
                    .attr('patternUnits', 'objectBoundingBox')
                    .append('image')
                    .attr('width', scaled_w)
                    .attr('height', scaled_w)
                    .attr('x', radius - scaled_w / 2) // r = 65 -> x = -25
                    .attr('y', radius - scaled_w / 2)
                    .attr('xlink:href', url)
                    .attr('opacity', 1.0)
                    .on('dblclick.zoom', null);
                this.vis.append('circle')
                    .attr('r', radius)
                    .attr('stroke-width', 0)
                    .attr('fill', 'url(#' + id + ')');
            }
        };

        d3vis.on("mousemove", () => {
            if (d3.event.target.tagName !== 'g') {
                widget.hideTooltip();
            }
        });

        widget.dimH = widgetHeight;
        widget.dimW = widgetWidth;
        widget.d3vis.attr('width', widget.dimW).attr('height', widget.dimH);
        widget.d3vis.attr('viewBox', '0 0 ' + widget.dimW + ', ' + widget.dimH);
        renderChart.call(widget);
        widget.expandAll.call(widget);
        if (personImageUrl)
            widget.addPersonImage.call(widget, personImageUrl);
    }

    /**
     * Returns a 'flattened' version of the traits tree, to display it as a list
     * @return array of {id:string, title:boolean, value:string} objects
     */
    function flatten(/*object*/ tree) {
        var arr = [],
            f   = function (t, level) {
                if (!t) return;
                if (level > 0 && (!t.children || level !== 2)) {
                    arr.push({
                        'id': t.name,
                        'title': t.children ? true : false,
                        'value': (typeof (t.percentage) !== 'undefined') ? Math.floor(t.percentage * 100) + '%' : '',
                        'sampling_error': (typeof (t.sampling_error) !== 'undefined') ? Math.floor(t.sampling_error * 100) + '%' : ''
                    });
                }
                if (t.children && t.id !== 'sbh') {
                    for (var i = 0; i < t.children.length; i++) {
                        f(t.children[i], level + 1);
                    }
                }
            };
        f(tree, 0);
        return arr;
    }

    $('#clear-btn').click(() => {
        $('#clear-btn').blur();
        $content.val('');
        updateWordCount();
    });


    function countWords(str) {
        return str.split(' ').length;
    }

    updateWordCount =  () => $('.wordsCount').text(countWords($content.val()));


    /**
     * Update words count on change
     */
    $content.change(updateWordCount);


    // $('#input').keypress(function (event) {
    //     if (event.which == 13) {
    //         event.preventDefault();
    //         $('#submit').click();
    //     }
    // });

}

run();
