/*Copyright 2012 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
#limitations under the License.*/

var renderToCanvas = function (width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));
    return buffer;
};

// from rot.js
/**
 * Always positive modulus
 * @param {int} n Modulus
 * @returns {int} this modulo n
 */
Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
}



/**
 * @namespace
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */
RNG = {
    /**
     * @returns {number}
     */
    getSeed: function() {
        return this._seed;
    },

    /**
     * @param {number} seed Seed the number generator
     */
    setSeed: function(seed) {
        seed = (seed < 1 ? 1/seed : seed);

        this._seed = seed;
        this._s0 = (seed >>> 0) * this._frac;

        seed = (seed*69069 + 1) >>> 0;
        this._s1 = seed * this._frac;

        seed = (seed*69069 + 1) >>> 0;
        this._s2 = seed * this._frac;

        this._c = 1;
        return this;
    },

    /**
     * @returns {float} Pseudorandom value [0,1), uniformly distributed
     */
    getUniform: function() {
        var t = 2091639 * this._s0 + this._c * this._frac;
        this._s0 = this._s1;
        this._s1 = this._s2;
        this._c = t | 0;
        this._s2 = t - this._c;
        return this._s2;
    },

    /**
     * @param {float} [mean=0] Mean value
     * @param {float} [stddev=1] Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
     * @returns {float} A normally distributed pseudorandom value
     */
    getNormal: function(mean, stddev) {
        do {
            var u = 2*this.getUniform()-1;
            var v = 2*this.getUniform()-1;
            var r = u*u + v*v;
        } while (r > 1 || r == 0);

        var gauss = u * Math.sqrt(-2*Math.log(r)/r);
        return (mean || 0) + gauss*(stddev || 1);
    },

    /**
     * @returns {int} Pseudorandom value [1,100] inclusive, uniformly distributed
     */
    getPercentage: function() {
        return 1 + Math.floor(this.getUniform()*100);
    },

    getMinMax: function(min, max) {
        return min + Math.floor(this.getUniform()*(max-min+1));
    },

    /**
     * @param {object} data key=whatever, value=weight (relative probability)
     * @returns {string} whatever
     */
    getWeightedValue: function(data) {
        var avail = [];
        var total = 0;

        for (var id in data) {
            total += data[id];
        }
        var random = Math.floor(this.getUniform()*total);

        var part = 0;
        for (var id in data) {
            part += data[id];
            if (random < part) { return id; }
        }

        return null;
    },

    /**
     * Get RNG state. Useful for storing the state and re-setting it via setState.
     * @returns {?} Internal state
     */
    getState: function() {
        return [this._s0, this._s1, this._s2, this._c];
    },

    /**
     * Set a previously retrieved state.
     * @param {?} state
     */
    setState: function(state) {
        this._s0 = state[0];
        this._s1 = state[1];
        this._s2 = state[2];
        this._c  = state[3];
        return this;
    },

    _s0: 0,
    _s1: 0,
    _s2: 0,
    _c: 0,
    _frac: 2.3283064365386963e-10 /* 2^-32 */
}

RNG.setSeed(123);//Date.now());


// -----------

Number.prototype.map = function(istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

Number.prototype.limit = function(min, max) {
	return Math.min(max, Math.max(min, this));
};

Number.prototype.round = function(precision) {
	precision = Math.pow(10, precision || 0);
	return Math.round(this * precision) / precision;
};

Number.prototype.floor = function() {
	return Math.floor(this);
};

Number.prototype.ceil = function() {
	return Math.ceil(this);
};

Number.prototype.toInt = function() {
	return (this | 0);
};

Array.prototype.erase = function(item) {
	for (var i = this.length; i--; i) {
		if (this[i] === item) this.splice(i, 1);
	}
	return this;
};


Array.prototype.random = function() {
	return this[ (RNG.getUniform() * this.length).floor() ];
};


merge = function(original, extended)
{
    for (var key in extended)
    {
        var ext = extended[key];
        if (
		typeof (ext) != 'object' ||
		ext instanceof Class
	)
        {
            original[key] = ext;
        }
        else
        {
            if (!original[key] || typeof (original[key]) != 'object')
            {
                original[key] = {};
            }
            merge(original[key], ext);
        }
    }
    return original;
};

function copy(object) 
{
    if (
   !object || typeof (object) != 'object' ||
   object instanceof Class
) {
        return object;
    }
    else if (object instanceof Array) {
        var c = [];
        for (var i = 0, l = object.length; i < l; i++) {
            c[i] = copy(object[i]);
        }
        return c;
    }
    else {
        var c = {};
        for (var i in object) {
            c[i] = copy(object[i]);
        }
        return c;
    }
};

 function ksort(obj) {
     if (!obj || typeof (obj) != 'object') {
         return [];
     }

     var keys = [], values = [];
     for (var i in obj) {
         keys.push(i);
     }

     keys.sort();
     for (var i = 0; i < keys.length; i++) {
         values.push(obj[keys[i]]);
     }

     return values;
    };
    
// -----------------------------------------------------------------------------
// Class object based on John Resigs code; inspired by base2 and Prototype
// http://ejohn.org/blog/simple-javascript-inheritance/
(function(){
var initializing = false, fnTest = /xyz/.test(function() { xyz; }) ? /\bparent\b/ : /.*/;

this.Class = function() { };
var inject = function(prop)
{
    var proto = this.prototype;
    var parent = {};
    for (var name in prop)
    {
        if (
		typeof (prop[name]) == "function" &&
		typeof (proto[name]) == "function" &&
		fnTest.test(prop[name])
	)
        {
            parent[name] = proto[name]; // save original function
            proto[name] = (function(name, fn)
            {
                return function()
                {
                    var tmp = this.parent;
                    this.parent = parent[name];
                    var ret = fn.apply(this, arguments);
                    this.parent = tmp;
                    return ret;
                };
            })(name, prop[name])
        }
        else
        {
            proto[name] = prop[name];
        }
    }
};

this.Class.extend = function(prop)
{
    var parent = this.prototype;

    initializing = true;
    var prototype = new this();
    initializing = false;

    for (var name in prop)
    {
        if (
		typeof (prop[name]) == "function" &&
		typeof (parent[name]) == "function" &&
		fnTest.test(prop[name])
	)
        {
            prototype[name] = (function(name, fn)
            {
                return function()
                {
                    var tmp = this.parent;
                    this.parent = parent[name];
                    var ret = fn.apply(this, arguments);
                    this.parent = tmp;
                    return ret;
                };
            })(name, prop[name])
        }
        else
        {
            prototype[name] = prop[name];
        }
    }

    function Class()
    {
        if (!initializing)
        {

            // If this class has a staticInstantiate method, invoke it
            // and check if we got something back. If not, the normal
            // constructor (init) is called.
            if (this.staticInstantiate)
            {
                var obj = this.staticInstantiate.apply(this, arguments);
                if (obj)
                {
                    return obj;
                }
            }
			
            for (var p in this)
            {
                if (typeof (this[p]) == 'object')
                {
                    this[p] = copy(this[p]); // deep copy!
                }
            }
			
            if (this.init)
            {
                this.init.apply(this, arguments);
            }
        }
        return this;
    }

    Class.prototype = prototype;
    Class.constructor = Class;
    Class.extend = arguments.callee;
    Class.inject = inject;

    return Class;
};
})();


