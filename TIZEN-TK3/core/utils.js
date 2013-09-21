/**
 * Left pad
 *   ie.   "k".lpad("o",5)  --> "ooook"
 * @param {string} [character="0"]
 * @param {int} [count=2]
 */
String.prototype.lpad = function(character, count) {
    var ch = character || "0";
    var cnt = count || 2;

    var s = "";
    while (s.length < (cnt - this.length)) { s += ch; }
    s = s.substring(0, cnt-this.length);
    return s+this;
}


var iterate = function(collection, iterator) {
    for (var i=0; i<collection.length; i++) {
        iterator(collection[i]);
    }
}
