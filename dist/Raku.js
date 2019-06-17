'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _noRiak = require('no-riak');

var _noRiak2 = _interopRequireDefault(_noRiak);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_BUCKET = 'default';
var DEFAULT_COUNTER_BUCKET = 'counters';
var DEFAULT_COUNTER_BUCKET_TYPE = 'counters';
var DEFAULT_SETS_BUCKET = 'sets';
var DEFAULT_SETS_BUCKET_TYPE = 'sets';

var KNOWN_BUCKET_TYPES = ['default', 'sets', 'counters'];

var sort_helper = function sort_helper(a, b) {
  var t_a = typeof a === 'undefined' ? 'undefined' : _typeof(a),
      t_b = typeof b === 'undefined' ? 'undefined' : _typeof(b);
  return t_a < t_b ? -1 : t_a > t_b ? 1 : a < b ? -1 : a > b ? 1 : 0;
};

var Raku = function () {
  function Raku() {
    _classCallCheck(this, Raku);

    this.client = new _noRiak2.default.Client();
    this.NoRiak = _noRiak2.default;
    // set(k, v) is an alias for put(k, v).
    this.set = this.put;
    this.bucket = DEFAULT_BUCKET;

    this.counter_bucket = DEFAULT_COUNTER_BUCKET;
    this.counter_bucket_type = DEFAULT_COUNTER_BUCKET_TYPE;

    this.sets_bucket = DEFAULT_SETS_BUCKET;
    this.sets_bucket_type = DEFAULT_SETS_BUCKET_TYPE;
  }

  _createClass(Raku, [{
    key: 'current_bucket',
    value: function current_bucket(type) {
      var bucket = void 0,
          prepend = '';
      if (type == undefined || type == 'kv') {
        bucket = this.bucket;
      } else if (type == 'counter' || type == 'counters') {
        bucket = this.counter_bucket;
      } else if (type == 'sets' || type == 'set') {
        bucket = this.sets_bucket;
      } else {
        bucket = DEFAULT_BUCKET;
      }

      if (process.env.NODE_ENV == 'test') {
        prepend = 'test/';
      }

      return prepend + bucket;
    }

    //----+
    // KV |
    //----+

  }, {
    key: 'put',
    value: function put(k, v) {
      return this.client.put({
        bucket: this.current_bucket(),
        key: k,
        content: { value: JSON.stringify(v) }
      });
    } // put


  }, {
    key: 'get',
    value: function get(k) {
      return this.client.get({
        bucket: this.current_bucket(),
        key: k
      }).then(function (result) {
        return result && JSON.parse(result.content[0].value.toString());
      });
    } // get

  }, {
    key: 'del',
    value: function del(k, bucket, type) {
      this.constructor.check_key(k);
      var args = { key: k };
      args.bucket = bucket || this.current_bucket();
      if (type) {
        args.type = type;
      }
      return this.client.del(args);
    }
  }, {
    key: 'bget',
    value: function bget(bucket, k) {
      return this.client.get({
        bucket: bucket,
        key: k
      }).then(function (result) {
        return result && JSON.parse(result.content[0].value.toString());
      });
    } // get2

  }, {
    key: 'bset',
    value: function bset(bucket, k, v) {
      return this.client.put({
        bucket: bucket,
        key: k,
        content: { value: JSON.stringify(v) }
      });
    } // set3

  }, {
    key: 'bdel',
    value: function bdel(bucket, k) {
      return this.del(k, bucket);
    }

    //----------+
    // SETS |
    //----------+

  }, {
    key: 'enbuf',
    value: function enbuf(v) {
      var json = JSON.stringify(v);
      return Buffer.from(json, 'utf8');
    }
  }, {
    key: 'debuf',
    value: function debuf(buf) {
      var v = buf.toString('utf8');
      return JSON.parse(v);
    }
  }, {
    key: 'get_sets',
    value: function get_sets(k) {
      this.constructor.check_key(k);
      return new _noRiak2.default.CRDT.Set(this.client, { bucket: this.current_bucket('sets'),
        type: this.sets_bucket_type,
        key: k });
    }
  }, {
    key: 'sismember',
    value: function sismember(k, v) {
      return this.smembers(k).then(function (values) {
        return values.includes(v);
      });
    }
  }, {
    key: 'sadd',
    value: function sadd(k) {
      var _this = this;

      var s = this.get_sets(k);

      for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        values[_key - 1] = arguments[_key];
      }

      values.forEach(function (v) {
        s.add(_this.enbuf(v));
      });
      return s.save();
    }
  }, {
    key: 'sreset',
    value: function sreset(k) {
      var _this2 = this;

      for (var _len2 = arguments.length, values = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        values[_key2 - 1] = arguments[_key2];
      }

      return this.sdel(k).then(function (_) {
        return _this2.sadd.apply(_this2, [k].concat(values));
      });
    }
  }, {
    key: 'srem',
    value: function srem(k, v) {
      var _this3 = this;

      var s = this.get_sets(k);
      return s.load().then(function (res) {
        return res.remove(_this3.enbuf(v)).save();
      }).catch(function (reason) {
        if (reason.toString().match(/RiakError.*precondition.*not_present/)) {
          return -1;
        }
      });
    }
  }, {
    key: 'sdel',
    value: function sdel(k) {
      return this.del(k, this.current_bucket('sets'), this.sets_bucket_type);
    }
  }, {
    key: 'smembers',
    value: function smembers(k) {
      var _this4 = this;

      this.constructor.check_key(k);
      var s = this.get_sets(k);
      return s.load().then(function (res) {
        return res.value().map(function (v) {
          return _this4.debuf(v);
        }).sort(sort_helper);
      });
    }
  }, {
    key: 'scard',
    value: function scard(k) {
      return this.smembers(k).then(function (values) {
        return values.length;
      });
    }

    //----------+
    // COUNTERS |
    //----------+

  }, {
    key: 'get_counter',
    value: function get_counter(k) {
      this.constructor.check_key(k);
      return new _noRiak2.default.CRDT.Counter(this.client, { bucket: this.current_bucket('counter'),
        type: this.counter_bucket_type,
        key: k });
    }
  }, {
    key: 'cget',
    value: function cget(k) {
      var counter = this.get_counter(k);
      return counter.load().then(function (counter) {
        return counter.value().toNumber();
      });
    }
  }, {
    key: 'cset',
    value: function cset(k, v) {
      var _this5 = this;

      return this.cget(k).then(function (x) {
        return _this5.get_counter(k).increment(-x + v).save();
      }).then(function (counter) {
        return counter.value().toNumber();
      });
    }
  }, {
    key: 'cinc',
    value: function cinc(k, v) {
      var counter = this.get_counter(k);
      var amount = v == undefined ? 1 : v;
      return counter.increment(amount).save().then(function (counter) {
        return counter.value().toNumber();
      });
    }
  }, {
    key: 'cdec',
    value: function cdec(k, v) {
      var amount = v == undefined ? -1 : -v;
      return this.cinc(k, amount);
    }
  }, {
    key: 'cdel',
    value: function cdel(k) {
      return this.del(k, this.current_bucket('counter'), this.counter_bucket_type);
    }

    // Make sure the key is a string.

  }, {
    key: 'bucket_types',


    // This is not a real bucket_type API, because Riak offers only a command-line interface to managing
    //  bucket types, which requires sudo.  You should manually list the known active bucket_types by
    //  assigning them like so:
    //
    // import Raku from 'raku'
    // Raku.KNOWN_BUCKET_TYPES = ['default', 'mysets', 'mycounters', 'etc']
    //
    // Of course, this will only change the bucket type list in the current file.
    //
    value: function bucket_types() {
      return Raku.KNOWN_BUCKET_TYPES;
    }
  }, {
    key: 'buckets',
    value: function buckets(bucket_type) {
      var _this6 = this;

      var bucket_types = bucket_type == undefined ? this.bucket_types() : [bucket_type];
      return Promise.all(bucket_types.map(function (type) {
        return _this6.client.listBuckets({ type: type });
      })).then(function (buckets) {
        return buckets.reduce(function (accum, arr, i) {
          var typed_buckets = arr.map(function (bucket) {
            return { bucket: bucket, type: bucket_types[i] };
          });
          return accum.concat(typed_buckets);
        }, []);
      });
    }
  }, {
    key: 'keys',
    value: function keys(bucket_type, bucket) {
      var _this7 = this;

      var __buckets = null;

      var get_buckets = Promise.resolve([{ type: bucket_type, bucket: bucket }]);
      if (bucket_type == undefined || bucket == undefined) {
        get_buckets = this.buckets();
      }
      return get_buckets.then(function (bucket_list) {
        __buckets = bucket_list;
        return Promise.all(bucket_list.map(function (args) {
          return _this7.client.listKeys(args);
        }));
      }).then(function (keynames_by_bucket) {
        var keys = [];
        __buckets.forEach(function (bucket_data, i) {
          var type = bucket_data.type,
              bucket = bucket_data.bucket;

          keynames_by_bucket[i].forEach(function (key) {
            return keys.push({ type: type, bucket: bucket, key: key });
          });
        });
        return keys;
      });
    }
  }, {
    key: 'delete_all',
    value: function delete_all(force) {
      var _this8 = this;

      if (!(force || process.env.NODE_ENV === 'test')) {
        throw 'Error Raku.delete_all(): refused to delete all keys: must call delete_all(true) or be in test environment.';
      }
      return this.keys().then(function (key_data) {
        // Delete only test data.
        var test_keys = key_data.filter(function (k) {
          return typeof k.bucket == 'string' && k.bucket.match(/^test/);
        });
        return Promise.all(key_data.map(function (args) {
          return _this8.client.del(args);
        }));
      });
    }
  }, {
    key: 'ping',
    value: function ping() {
      return this.client.ping().then(function (res) {
        if (res == null) {
          return 'pong';
        } else {
          return 'ping(): ' + res;
        }
      });
    }
  }], [{
    key: 'check_key',
    value: function check_key(k) {
      if (typeof k != 'string') {
        throw new Error('The counter key must be a string.');
      }
    }
  }]);

  return Raku;
}(); // class Raku

Raku.DEFAULT_BUCKET = DEFAULT_BUCKET;
Raku.DEFAULT_COUNTER_BUCKET = DEFAULT_COUNTER_BUCKET;
Raku.DEFAULT_COUNTER_BUCKET_TYPE = DEFAULT_COUNTER_BUCKET_TYPE;
Raku.DEFAULT_SETS_BUCKET = DEFAULT_SETS_BUCKET;
Raku.DEFAULT_SETS_BUCKET_TYPE = DEFAULT_SETS_BUCKET_TYPE;
Raku.KNOWN_BUCKET_TYPES = KNOWN_BUCKET_TYPES;

exports.default = Raku;