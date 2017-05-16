var api = {
    consumer_key: 'j4KcgvPO5bm3fIDOiVYSS18sR',
    consumer_secret: '0SoE4DfJIpOO1udF3125YDZFmErkJmxngj9ljNrZUOHOZPo0bX',
    access_token: '794113952498257925-3HZW4LSB1X9poXiPrKCuM96TBIfePQi',
    access_token_secret: '9hhMd7U0xkkJvoltKWlqy8dwGtq2VZzN3joZ8hW7u9rIR'

};

function run() {

    $('#submit').click(function (e) {

        e.preventDefault();

        var $input = $('input').val();
        var $proxy = 'http://galvanize-twitter-proxy.herokuapp.com/';

        $.ajax({
            url: $proxy + 'statuses/user_timeline.json?count=200&screen_name=' + $input,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                for(var index in data) {
                    var text = data[index].text;
                    $('#tweets').append(text);
                    console.log(data.length);
                }
            }
        });
    });


    $('#input').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $('#submit').click();
        }
    });
}



run();