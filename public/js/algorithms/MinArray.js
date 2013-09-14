
MinArray = Class.extend({
    _vals: {},
    _recycledIds: [],
    _nextId: 0,
    length: 0,

    insert: function(val) {
        var id;
        var recycledId = this._recycledIds.shift();
        if(recycledId !== undefined){
            id = recycledId;
        }else{
            id = this._nextId++;
        }
        this._vals[id] = val;
        this.length++;
        return id;
    },

    remove: function(id) {
        if(this._vals[id] === undefined){
            return false;
        }
        delete this._vals[id];
        this._recycledIds.push(id);
        this.length--;
        return true;
    },

    iterate: function(cbk) {
        var _vals = this._vals;
        for (var k in _vals) {
            var item = _vals[k];
            cbk(item, k);
        }
    },

    get: function(id) {
        return this._vals[id];
    },

    set: function(id, val) {
        return this._vals[id] = val;
    }
});

