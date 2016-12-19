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

### API

This client only has only 3 distinct operations: get, put, del.  set() is an alias for put()

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

#### Which bucket?

The unspecified fall-back value of the bucket is "default". To change the fall-back value just set assign it a new valu:

#### bucket=
````javascript
raku.bucket = "mybucket"
````

#### Getting explicit

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

### NB

2016-12-13: I just started learning Riak, and just released this little wrapper for myself.  I'll be adding features as I learn more about Riak.  I'm happy to hear from anybody using this.  You can email me here: thirdreplicator@gmail.com

### License

MIT, enjoy.
