var selected_word = undefined;
var visible_link_root = undefined;
var current_composition, current_booknum, current_chapter, current_verse;
// var ms_1 = 1;
// var ms_2 = 17;

function jq_escape_selector(s){
    return s.replace( /(:|\.|\[|\]|\ )/g, "\\$1" );
}

function get_data(data_form, callback) {
    jQuery.ajax({
    	url: 'resources/cgi-bin/gateway.pl',
    	data: data_form,
    	cache: false,
    	contentType: false,
    	processData: false,
    	type: 'POST',
    	success: callback,
        error: function(){
            alert("Error retrieving data from database.");
        }
	});
}

function get_data_url(url, callback) {
    jQuery.ajax({
    	url: url,
    	cache: false,
    	type: 'GET',
    	success: callback,
        error: function(){
            alert("Error retrieving data from database.");
        }
	});
}

function load_ms(ms){
    var text_data = new FormData();
	text_data.append('transaction', 'get_ms_text');
	text_data.append('ms', ms);
    get_data(text_data, function(responseText){
        var text = '';
        var results = responseText['results'];
        results.forEach(function(element) {
            text += ' ' + element.surface_transcription;
        }, this);
        $('#textview').html(text);
    });
}

function get_books(composition){
	var url = "http://52.59.165.13:8080/getBookNums/" + composition
    get_data_url(url, function(results){
        results.forEach(function(element) {
            var book_num = element.composition_book_number;
            var book_num_div = $('<div/>',{
                id: 'book-' + book_num,
                class: 'book_div'
            }).appendTo('#textview');
            get_chapters(composition, book_num, book_num_div);
        }, this);
    });
}

function get_chapters(composition, book_num, book_num_div){
    var url = "http://52.59.165.13:8080/getChapters/" + composition + "/" + book_num;
    get_data_url(url, function(results){
        results.forEach(function(element) {
            var chapter = element.composition_chapter;
            var book_chapter_div = $('<div/>',{
                id: 'chapter-' + book_num + '-' + chapter,
                class: 'chapter_div'
            }).appendTo(book_num_div);
            get_verses(composition, book_num, chapter, book_chapter_div);
        }, this);
    });
}

function get_verses(composition, book_num, chapter, book_chapter_div) {
    var url = "http://52.59.165.13:8080/getVerses/" + composition + "/" + book_num + "/" + chapter;
    get_data_url(url, function(results){
        results.forEach(function(element) {
            var verse = element.composition_verse;
            var book_verse_div = $('<div/>',{
                id: 'verse-' + book_num + '-' + chapter + '-' + verse,
                class: 'verse_div'
            }).appendTo(book_chapter_div);
            get_words(composition, book_num, chapter, verse, book_verse_div);
        }, this);
    });
}

function get_words(composition, book_num, chapter, verse, book_verse_div) {
    var url = "http://52.59.165.13:8080/getVocables/" + composition + "/" + book_num + "/" + chapter + "/" + verse;
    get_data_url(url, function(results){
        var word_span = $('<span/>',{
                id: 'verse-' + book_num + '-' + chapter + '-' + verse + '-heading',
                class: 'verse_heading ignore'
            });
        $(word_span).html(book_num + ' ' + composition + ' ' + chapter + ':' + verse + '\n').appendTo(book_verse_div);
        var manuscript;
        var ms_verse_span;
        var num_of_elements = [];
        var num_of_elements_idx = -1;
        results.forEach(function(element, index) {
            if (manuscript != element.manuscript_name){
                manuscript = element.manuscript_name;
                num_of_elements.push(0);
                num_of_elements_idx += 1;
                 $('<br/>').appendTo(book_verse_div);
                var manuscript_span = $('<span/>', {class: 'word_info ignore'});
                $(manuscript_span).html('&emsp;' + manuscript + ':&ensp;').appendTo(book_verse_div);
                ms_verse_span = $('<span/>',{class: 'ms_verse_span', dir: 'auto'}).appendTo(book_verse_div);
            }
            var verse = element.composition_verse;
            var word_span = $('<div/>',{
                id: 'word-' + element.id + '-' + manuscript,
                class: 'verse_word'
            }).appendTo(ms_verse_span);

            var connections = $('<div/>',{
                id: 'connection-' + element.id,
                class: 'verse_word_upper_info'
            }).appendTo(word_span);

            var vocable = $('<div/>',{
                id: 'vocable-' + element.id + '-' + manuscript,
                class: 'verse_vocable'
            });
            $(vocable).html(element.surface_transcription).appendTo(word_span);
            num_of_elements[num_of_elements_idx] += 1;

            var word_id = $('<div/>',{
                id: 'word-id' + element.id,
                class: 'verse_word_lower_info'
            });
            $(word_id).html(element.id).appendTo(word_span);
        }, this);
        var max_elements = num_of_elements.reduce(function(x,y){
            return (x > y) ? x : y;
        });
    });
}

function db_vocable_joins(){
    var url = "http://52.59.165.13:8080/getVocableLinks/" + $("#comp_dropdown option:selected").text();
    get_data_url(url, function(results){
        results.forEach(function(element) {
            add_link('vocable-' + element.primary_vocable_id, 'vocable-' + element.secondary_vocable_id);
        });
    });
}

function set_focused(id){
    selected_word = id;
    var topPos = document.getElementById(id).offsetTop;
    var textview = document.getElementById('textview');
    textview.scrollTop = topPos - 10 - (textview.clientHeight / 2);
    var position = document.getElementById(id).parentNode.parentNode.parentNode.id;
    var book_num = position.split('-')[1];
    var chapter = position.split('-')[2];
    var verse = position.split('-')[3];
    if (verse != current_verse || chapter != current_chapter || book_num != current_booknum){
        current_verse = verse;
        current_chapter = chapter;
        current_booknum = book_num;
        var url = "http://52.59.165.13:8080/verseVssFromDB/" + $("#comp_dropdown option:selected").text() + '/' + current_booknum + '/' + current_chapter + '/' + current_verse;
        get_data_url(url, function(results){
            // var verseview = document.getElementById('verseview');
            // while (verseview.firstChild) verseview.removeChild(verseview.firstChild);
            $('#verseview').empty();
            $('#verseview').append(results);
        });  
    }
}

function connect_words(event){
    if (event.target.id.startsWith('vocable-') && document.activeElement != event.target){
        if (!event.target.hasAttribute('tabindex') && selected_word){
            event.target.classList.add('word_selected');
            add_link(jq_escape_selector(selected_word), jq_escape_selector(event.target.id));
            document.getElementById(selected_word).focus();
        }
        // if (selected_word){
        //     if (selected_word == event.target) {
        //         console.log('clicked the same word.');
        //         $(event.target).removeClass('word_selected');
        //         selected_word = undefined;
        //     } else {
        //         $(event.target).addClass('word_selected');
        //         add_link(jq_escape_selector(selected_word.id), jq_escape_selector(event.target.id));
        //         selected_word = undefined;
        //     }
        // } else {
        //     $(event.target).addClass('word_selected');
        //     selected_word = event.target;
        // }
    }
    if (event.target.id.startsWith('link-')){
        $svg.empty();
        delete_link(event.target.id);
    }
}

function show_details(event){
    if (event.target.id.startsWith('link-')){
        if (visible_link_root) {
            $svg.empty();
        }
        visible_link_root = event.target.id;
        draw_line(event.target.id);
    } else {
        if (visible_link_root){
            visible_link_root = undefined;
            $svg.empty();
        }
    }
}

function load_direct(){
    Array.from(document.getElementsByClassName("book_div")).forEach(
    function(element) {
        element.parentNode.removeChild(element);
    }
);
    var url = 'http://52.59.165.13:8080/htmlFromDB/' + $("#comp_dropdown option:selected").text() + "/" + ms_1 + "/" + ms_2;
    get_data_url(url, function(responseText){
            $('#textview').append(responseText);
            db_vocable_joins();
        });
}

function populate_comp_dropdowns(selector, url, firstmessage, type){
    if (type == 0) {
        $(selector).change(function() {
            load_direct();
        });
    } else if (type == 1){
        $(selector).change(function() {
            var val = $(selector).val();
            ms_1 = val;
        });
    } else if (type == 2){
        $(selector).change(function() {
            var val = $(selector).val();
            ms_2 = val;
        });
    }
    $(selector).change(function() {
        var val = $(selector + " option:selected").text();
        load_direct(val);
    });
    var first_option = $('<option/>',{
                                        value: '',
                                        class: 'ms_option',
                                        disabled: 'disabled',
                                        selected: 'selected'
                                    }).appendTo(selector);
    first_option.html(firstmessage);
    get_data_url(url, function(responseText){
        responseText.forEach(function(element) {
            var name = type == 0 ? element.composition_name : element.manuscript_name;
            var option = $('<option/>',{
                                        value: element.id,
                                        class: 'ms_option'
                                    }).appendTo(selector);
            option.html(name);
        }, this);
    });
}

function populate_dropdowns(selector, url, firstmessage, type){
    if (type == 0) {
        $(selector).change(function() {
            var val = $(selector + " option:selected").text();
            load_direct(val);
        });
    } else if (type == 1){
        $(selector).change(function() {
            var val = $(selector).val();
            ms_1 = val;
        });
    } else if (type == 2){
        $(selector).change(function() {
            var val = $(selector).val();
            ms_2 = val;
        });
    }
    var first_option = $('<option/>',{
                                        value: '',
                                        class: 'ms_option',
                                        disabled: 'disabled',
                                        selected: 'selected'
                                    }).appendTo(selector);
    first_option.html(firstmessage);
    get_data_url(url, function(responseText){
        responseText.forEach(function(element) {
            var name = type == 0 ? element.composition_name : element.manuscript_name;
            var option = $('<option/>',{
                                        value: element.id,
                                        class: 'ms_option'
                                    }).appendTo(selector);
            option.html(name);
        }, this);
    });
}

$(function() {
    $( '#textview' ).on( 'click', function(event){connect_words(event);});
    $( '#textview' ).on( 'mousemove', function(event){show_details(event);});

    populate_dropdowns('#comp_dropdown', 'http://52.59.165.13:8080/getCompositions', 'Select a composition:', 0);
    populate_dropdowns('#ms1_dropdown', 'http://52.59.165.13:8080/getMss', 'Select a manuscript:', 1);
    populate_dropdowns('#ms2_dropdown', 'http://52.59.165.13:8080/getMss', 'Select a manuscript:', 2);    
});