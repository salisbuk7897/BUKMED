$(document).ready(function(){
    $("form#changeQuote").on('submit', function(e){
        e.preventDefault();
        var data = {quote: $("#qtt").val()};
        $.ajax({
            type: 'post',
            url: '/ajax',
            data: data,
            //dataType: 'text'
        })
        .done(function(e){
            $('h1').html(e.quote = data.quote);
        });
    });

    /*$("#sa").click(function(event){
        event.preventDefault();
        $.ajax({
            url: '/ajax',
        })
        .done(function(e){
            $('.main').html(e)
        });
    });*/
});

