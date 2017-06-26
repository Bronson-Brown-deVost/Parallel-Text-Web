var line;
var color_list = ['red','blue','darkred','indigo','cyan','violet','green'];
var color_index = 0;
var $svg;

function get_middle(element){
    var textview = document.getElementById("textview");
    return {
        x: $(element).position().left + $('#textview').scrollLeft() + 
        ($(element).width() * 0.75),
        y: $(element).position().top + $('#textview').scrollTop() + 
        ($(element).height() * 0.5)
    }
}

function draw_line(id_1){
    var elem_1 = $('#' + id_1);
    var elem_2 = $('#link-' + id_1.split('-')[2] + '-' + id_1.split('-')[1]);
    var pos_1 = get_middle(elem_1);
    var pos_2 = get_middle(elem_2);
    var x_offset = Math.min(pos_1.x, pos_2.x);
    var y_offset = Math.min(pos_1.y, pos_2.y);
    pos_1.x = pos_1.x - x_offset;
    pos_1.y = pos_1.y - y_offset;
    pos_2.x = pos_2.x - x_offset;
    pos_2.y = pos_2.y - y_offset;
    $svg.css({'left': x_offset, 'top': y_offset});
    var line = Raphael("svgContainer", Math.abs(pos_1.x - pos_2.x) + 4, Math.abs(pos_1.y - pos_2.y) + 4);
    
    var current_line = line.path("M " + pos_1.x + ',' + pos_1.y + " L " +
          pos_2.x + "," + pos_2.y);
    current_line.attr({stroke: 'red', 'stroke-width': 4});
}

function delete_link(elem_id){
    var id_1 = elem_id.split('-')[1];
    var id_2 = elem_id.split('-')[2];
    var join_data = new FormData();
    var url = 'http://52.59.165.13:8080/unlinkVocables/' + id_1 + "/" + id_2;
    get_data_url(url);

    $('#' + elem_id).remove();
    $('#link-' + id_2 + '-' + id_1).remove();
}

function add_link(elem_1, elem_2){
    var word_id_elem_1 = elem_1.split('-')[1];
    var word_id_elem_2 = elem_2.split('-')[1];
    if (document.getElementById('connection-' + word_id_elem_1) && document.getElementById('connection-' +  word_id_elem_2)){
        var join_data = new FormData();
        var url = 'http://52.59.165.13:8080/linkVocables/' + word_id_elem_1 + "/" + word_id_elem_2;
        get_data_url(url);

        var span_1 = document.createElement("div");
        span_1.setAttribute('id', 'link-' + word_id_elem_1 + '-' + word_id_elem_2);
        span_1.setAttribute('class', 'link_vocable');
        span_1.style.background = color_list[color_index];
        // span_1.innerHTML = '·';
        connection_1 = document.getElementById('connection-' + word_id_elem_1);
        connection_1.append(span_1);

        var span_2 = document.createElement("div");
        span_2.setAttribute('id', 'link-' + word_id_elem_2 + '-' + word_id_elem_1);
        span_2.setAttribute('class', 'link_vocable');
        span_2.style.background = color_list[color_index];
        // span_2.innerHTML = '·';
        connection_2 = document.getElementById('connection-' +  word_id_elem_2);
        connection_2.append(span_2);

        color_index = color_index + 1 < 7 ? color_index + 1 : 0;
    } 
}

function redraw_links(){
}
$(function(){
    $svg = $('#svgContainer');
});