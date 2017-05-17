var api = {
    consumer_key: 'j4KcgvPO5bm3fIDOiVYSS18sR',
    consumer_secret: '0SoE4DfJIpOO1udF3125YDZFmErkJmxngj9ljNrZUOHOZPo0bX',
    access_token: '794113952498257925-3HZW4LSB1X9poXiPrKCuM96TBIfePQi',
    access_token_secret: '9hhMd7U0xkkJvoltKWlqy8dwGtq2VZzN3joZ8hW7u9rIR'

};
var widgetId = 'vizcontainer', // Must match the ID in index.jade
    widgetWidth = 700, widgetHeight = 700, // Default width and height
    personImageUrl = 'images/app.png', // Can be blank
    language = 'en'; // language selection

// Jquery variables
var $content = $('.content'),
    $loading   = $('.loading'),
    $error     = $('.error'),
    $errorMsg  = $('.errorMsg'),
    $traits    = $('.traits'),
    $captcha   = $('.captcha'),
    $data      = $('#data');


function run() {

    $('#btn').click(function (e) {
        e.preventDefault();
        var $input = $('input').val();
        var $proxy = 'https://galvanize-twitter-proxy.herokuapp.com/';
        $.ajax({
            url: $proxy + 'statuses/user_timeline.json?count=200&screen_name=' + $input,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                for (var index in data) {
                    var text = data[index].text;
                    $data.append(text);
                    console.log(data.length);
                }
            }
        });
        $('#bg').slideUp();
        $('#hidden-page').removeClass('hidden');
    });


    $('.analysis-btn').click(function (e) {
        e.preventDefault();
        $.ajax({
            headers: {
                'contentItems': [{
                    'content': $data.val()
                }]
            },
            type: 'POST',
            url: 'https://watson-api-explorer.mybluemix.net/personality-insights/api/v2/profile?raw_scores=false&csv_headers=false&consumption_preferences=false&version=2016-10-20',
            dataType: 'json',
            success: function (response) {
                if (response.error) {
                    showError(response.error);
                } else {
                    showTraits(response);
                    showTextSummary(response);
                    showVizualization(response);
                }

            },
            error: function (xhr) {
                $loading.hide();

                var error;
                try {
                    error = JSON.parse(xhr.responseText || {});
                } catch (e) {
                }

                if (xhr && xhr.status === 429) {
                    $captcha.css('display', 'table');
                    $('.errorMsg').css('color', 'black');
                    error.error = 'Complete the captcha to proceed';
                } else {
                    $('.errorMsg').css('color', 'red');
                }

            }
        });
    });
    function showTraits(data) {
        console.log('showTraits()');
        $traits.show();

        var traitList = flatten(data.tree),
            table     = $traits;

        table.empty();

        // Header
        $('#header-template').clone().appendTo(table);

        // For each trait
        for (var i = 0; i < traitList.length; i++) {
            var elem = traitList[i];

            var Klass = 'row';
            Klass += (elem.title) ? ' model_title' : ' model_trait';
            Klass += (elem.value === '') ? ' model_name' : '';

            if (elem.value !== '') { // Trait child name
                $('#trait-template').clone()
                    .attr('class', Klass)
                    .find('.tname')
                    .find('span').html(elem.id).end()
                    .end()
                    .find('.tvalue')
                    .find('span').html(elem.value === '' ? '' : elem.value)
                    .end()
                    .end()
                    .appendTo(table);
            } else {
                // Model name
                $('#model-template').clone()
                    .attr('class', Klass)
                    .find('.col-lg-12')
                    .find('span').html(elem.id).end()
                    .end()
                    .appendTo(table);
            }
        }
    }

    /**
     * Construct a text representation for big5 traits crossing, facets and
     * values.
     */
    function showTextSummary(data) {
        console.log('showTextSummary()');
        var paragraphs = textSummary.assemble(data.tree);
        var div = $('.summary-div');
        $('.outputMessageFootnote').text(data.word_count_message ? '**' + data.word_count_message + '.' : '');
        div.empty();
        paragraphs.forEach(function (sentences) {
            $('<p></p>').text(sentences.join(' ')).appendTo(div);
        });
    }

    function showVizualization(theProfile) {
        $('#' + widgetId).empty();
        var d3vis   = d3.select('#' + widgetId)
                .append('svg:svg'),
            tooltip = {
                element: d3.select('body')
                    .append('div')
                    .classed('tooltip', true),
                target: undefined
            };
        var widget = {
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
                    var
                        tooltip     = demo.getTooltip(d.id.replace('_parent', '')),
                        tooltipText = d.name + ' (' + d.category + '): ' + tooltip.msg;
                    console.debug(tooltipText);
                    this.tooltip.element
                        .text(tooltipText)
                        .classed('in', true);
                }

                d3event.stopPropagation();
            },
            updateTooltipPosition: function (d3event) {
                this.tooltip.element
                    .style('top', (d3event.pageY - 16) + 'px')
                    .style('left', (d3event.pageX - 16) + 'px');
                d3event.stopPropagation();
            },
            hideTooltip: function () {
                console.debug('[hideTooltip]');
                this.tooltip.element
                    .classed('in', false)
                ;
            },
            id: 'SystemUWidget',
            COLOR_PALLETTE: ['#1b6ba2', '#488436', '#d52829', '#F53B0C', '#972a6b', '#8c564b', '#dddddd'],
            expandAll: function () {
                this.vis.selectAll('g').each(function () {
                    var g = d3.select(this);
                    if (g.datum().parent && // Isn't the root g object.
                        g.datum().parent.parent && // Isn't the feature trait.
                        g.datum().parent.parent.parent) { // Isn't the feature dominant trait.
                        g.attr('visibility', 'visible');
                    }
                });
            },
            collapseAll: function () {
                this.vis.selectAll('g').each(function () {
                    var g = d3.select(this);
                    if (g.datum().parent !== null && // Isn't the root g object.
                        g.datum().parent.parent !== null && // Isn't the feature trait.
                        g.datum().parent.parent.parent !== null) { // Isn't the feature dominant trait.
                        g.attr('visibility', 'hidden');
                    }
                });
            },
            addPersonImage: function (url) {
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

        d3vis.on("mousemove", function () {
            if (d3.event.target.tagName != 'g') {
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

    function inputData(data) {

    }

        $('.clear-btn').click(function () {
            $('.clear-btn').blur();
            $data.val('');
            updateWordsCount();
        });

        /**
         * Update words count on change
         */
        $content.change(updateWordsCount);

        /**
         * Update words count on copy/past
         */
        $content.bind('paste', function () {
            setTimeout(updateWordsCount, 100);
        });



        // $('#input').keypress(function (event) {
        //     if (event.which == 13) {
        //         event.preventDefault();
        //         $('#submit').click();
        //     }
        // });

}

run();