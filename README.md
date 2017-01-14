# Raku (楽)

A simplified Javascript client for working with Riak 2.0, based on [no-riak](https://github.com/oleksiyk/no-riak).  "Raku" means "easy" or "simple" in Japanese and it kind of sounds like "Riak."  Basically, I wanted a client where i could just type

```javascript
set(key, value)
```

or

```javascript
get(key)
```

but I found that most clients take in a slew of arguments that I didn't want to think about.  So, I took the most reasonable promise-based client that I could find, [no-riak](https://github.com/oleksiyk/no-riak) and wrapped it in a class.

### Usage

```sh
$ npm install --save raku
```

```javascript
import Raku from Raku

raku = new Raku()

raku.set('mykey', 42)
  .then(() => raku.get('mykey'))
  .then(value => {
    console.log('mykey is ' + value)
  })
```

## API

Currently, this client supports has only 3 distinct KV operations (get, put/set, del) and some counter operations (cget, cset, cinc, cdec).

### KV (key-value) API

#### put

```javascript
raku.put(key, value)
```

The value will be serialized as a JSON string before being stored.

#### set

raku.set is an alias for raku.put

#### get

```javascript
raku.get(key)
```

The result will be a promise that resolves into the corresponding Javascript data type.  For example, if the value was stored as a boolean, you'll get back a promise that resolves to a boolean.

#### del
````javascript
raku.del(key)
````

This will delete the key in the Riak database.

### [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) [Riak Counters](http://docs.basho.com/riak/kv/2.2.0/developing/data-types/counters/)

** Note: Before using counters for the first time, you must activate a counter bucket type using the riak-admin at the command line. This will make your Riak cluster incompatible with earlier versions. **

````bash
riak-admin bucket-type create counters '{"props":{"datatype":"counter"}}'
riak-admin bucket-type activate counters
````

### KV (key-value) API

#### cset
````javascript
raku.cset(key, value)
````

Set and save a counter to an arbitrary integer value (positive or negative).  Returns a promise that evaluates to the new value.

#### cget
````javascript
raku.cget(key)
````

Get a counter stored at **key** from the database.  Returns a promise that evaluates to the value.

#### cinc
````javascript
raku.cinc(key, amount)
````

Increment and save a counter by any amount.  Negative amounts will decrement the value. Returns a promise that evaluats to the new value. If multiple clients nearly simultaneously increment a value by one, each client will resolve to a unique number, thanks to the magic of Riak CRDT counters. If no amount is given, it will be assumed to be 1.

#### cdec
````javascript
raku.cdec(key, amount)
````

Decrement and save a counter.  Positive amounts will decrement the counter, and negative amounts will increment the counter.  If no amount argument is given, the counter will be decremented by 1.

### Bucket and bucket types API

For the aforementioned KV functions (get, put/set, del), the unspecified fall-back value of the bucket is "default".  To change the fall-back value just set assign it a new value:

#### bucket=
````javascript
raku.bucket = "mybucket"
````

KV functions don't have a default bucket type.

CRDT Counters have a default bucket type of "counters" and a default bucket also named "counters".  You can change these defaults like so:

#### counter_bucket=
````javascript
raku.counter_bucket = "user_ids"
````

#### counter_bucket_type=
````javascript
raku.counter_bucket_type = "last_ids"
````

### Getting explicit

You can specify the bucket in the with the first argument with the following 3 functions:

#### bget
````javascript
raku.bget(bucket, key)
````

Get the value at (bucket, key).  Returns a promise.

#### bset
````javascript
raku.bset(bucket, key, value)
````

Set the value at (bucket, key) to value.  Returns a promise.

#### bdel
````javascript
raku.bdel(bucket, key)
````

Delete the value at (bucket, key).  Returns a promise.

### More power

If you want the full power of a more sophisticated client, you can access the wrapped no-riak client like this:

```javascript
  raku.client   # a no-riak client
  raku.NoRiak   # the no-riak module
```

See [no-riak](https://github.com/oleksiyk/no-riak) for details.

### Notes

2016-12-19: I just released v2.0.0.  That doesn't mean it's mature.  Following the semantic versioning convention, it just means that there's a breaking change.  There's breaking because the fall-back value of the bucket is no longer DEFAULT_BUCKET but instead it is this.bucket of the client instance, raku.

2016-12-13: I just started learning Riak, and just released this little wrapper for myself.  I'll be adding features as I learn more about Riak.  I'm happy to hear from anybody using this.  You can email me here: thirdreplicator@gmail.com

### License

MIT, enjoy.
