# Raku (楽)

A simplified Javascript client for working with Riak 2.0, based on [no-riak](https://github.com/oleksiyk/no-riak).	"Raku" means "easy" or "simple" in Japanese and it kind of sounds like "Riak."	Basically, I wanted a client where i could just type

```javascript
set(key, value)
```

or

```javascript
get(key)
```

but I found that most clients take in a slew of arguments that I didn't want to think about.	So, I took the most reasonable promise-based client that I could find, [no-riak](https://github.com/oleksiyk/no-riak) and wrapped it in a class.

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

Currently, this client supports 3 distinct KV operations (get, put/set, del), counters (cget, cset, cinc, cdec, cdel), and sets (sadd, srem, smembers, sismember, sdel, scard).

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

### Getting explicit

You can specify the bucket in the with the first argument with the following 3 KV functions.

#### bget
````javascript
raku.bget(bucket, key)
````

Get the value at (bucket, key).  Returns a promise.

#### bset
````javascript
raku.bset(bucket, key, value)
````

Set the value at (bucket, key) to value.	Returns a promise.

#### bdel
````javascript
raku.bdel(bucket, key)
````

Delete the value at (bucket, key).	Returns a promise.

### [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) [Riak Counters](http://docs.basho.com/riak/kv/2.2.0/developing/data-types/counters/)

**Note: Before using counters for the first time, you must activate a counter bucket type using the riak-admin at the command line. This will make your Riak cluster incompatible with earlier versions.**

````bash
$ sudo riak-admin bucket-type create counters '{"props":{"datatype":"counter"}}'
$ sudo riak-admin bucket-type activate counters
````

### CRDT Counters API

#### cset
````javascript
raku.cset(key, value)
````

Set and save a counter to an arbitrary integer value (positive or negative).	Returns a promise that evaluates to the new value.

#### cget
````javascript
raku.cget(key)
````

Get a counter stored at **key** from the database.	Returns a promise that evaluates to the value.

#### cinc
````javascript
raku.cinc(key, amount)
````

Increment and save a counter by any amount.  Negative amounts will decrement the value. Returns a promise that evaluats to the new value. If multiple clients nearly simultaneously increment a value by one, each client will resolve to a unique number, thanks to the magic of Riak CRDT counters. If no amount is given, it will be assumed to be 1.

#### cdec
````javascript
raku.cdec(key, amount)
````

Decrement and save a counter.  Positive amounts will decrement the counter, and negative amounts will increment the counter.	If no amount argument is given, the counter will be decremented by 1. Returns a promise that evaluates to the new value.

#### cdel
````javascript
raku.cdel(key)
````

Delete a counter.  This will delete the key in the `counters` bucket.  Returns a promise that evaluates to null.


### [CRDT](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) [Riak Sets](http://docs.basho.com/riak/kv/2.2.0/developing/data-types/sets/)

**Note: As with counters, before using CRDT sets for the first time, you must activate a set bucket type using the riak-admin at the command line.**

````bash
$ sudo riak-admin bucket-type create sets '{"props":{"datatype":"set"}}'
$ sudo riak-admin bucket-type activate sets
````

### CRDT Sets API

Where possible, I tried to follow the Redis API for operations on sets.

#### sadd
````javascript
raku.sadd(key, value)
````

Add a value to the set. Returns a promise.

#### srem
````javascript
raku.srem(key, value)
````

Remove a value from the set. Returns a promise.

#### sismember
````javascript
raku.sismember(key, value)
````

Check if a value is a member of the set. Returns a promise which resolves to a boolean.

#### smembers
````javascript
raku.smembers(key)
````

List all members of the set. Returns a promise which resolves to a JS array of the set members.

#### sdel
````javascript
raku.sdel(key)
````

Delete all members of the set. Returns a promise.

#### scard
````javascript
raku.scard(key)
````

Count members in the set. Returns a promise that resolves to the set's count.

### Bucket and bucket types API

For the aforementioned KV, counter, and set functions rely on an unspecified fall-back value, one for each data type.	To change the fall-back value just assign it a new value:

For KV data types,

#### bucket=
````javascript
raku.bucket = "mybucket"
````

KV functions have a default bucket but don't have a default bucket **type**.

CRDT Counters have a default bucket type of "counters" and a default bucket also named "counters".	You can change these defaults like so:

#### counter_bucket=
````javascript
raku.counter_bucket = "user_ids"
````

#### counter_bucket_type=
````javascript
raku.counter_bucket_type = "last_ids"
````

CRDT sets have a default bucket type of "sets".  The default bucket is also called "sets" and can be changed similar to the counters bucket type.  To avoid confusion with the operation called "set", when referring to the data type "set" I use the word "sets".


#### sets_bucket=
````javascript
raku.sets_bucket = "fk_Post"
````

#### sets_bucket_type=
````javascript
raku.sets_bucket_type = "foreign_keys"
````

### More power

If you want the full power of a more sophisticated client, you can access the wrapped no-riak client like this:

```javascript
	raku.client		# a no-riak client
	raku.NoRiak		# the no-riak module
```

See [no-riak](https://github.com/oleksiyk/no-riak) for details.

### Notes

2017-02-20: Added CRDT set operations: sismember, smembers, sadd, srem, sdel, scard.

2017-01-16: Just added cdel for deleting a counter: cdel.

2017-01-13: Just added support for incrementing counters: cset, cget, cinc, cdec.

2016-12-19: I just released v2.0.0.  That doesn't mean it's mature.  Following the semantic versioning convention, it just means that there's a breaking change.	There's breaking because the fall-back value of the bucket is no longer DEFAULT_BUCKET but instead it is this.bucket of the client instance, raku.

2016-12-13: I just started learning Riak, and just released this little wrapper for myself.  I'll be adding features as I learn more about Riak.	I'm happy to hear from anybody using this.	You can email me here: thirdreplicator@gmail.com

### License

MIT, enjoy.
