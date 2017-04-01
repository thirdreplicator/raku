import NoRiak from 'no-riak'

const DEFAULT_BUCKET = 'default'
const DEFAULT_COUNTER_BUCKET = 'counters'
const DEFAULT_COUNTER_BUCKET_TYPE = 'counters'
const DEFAULT_SETS_BUCKET = 'sets'
const DEFAULT_SETS_BUCKET_TYPE = 'sets'

const KNOWN_BUCKET_TYPES = ['default', 'sets', 'counters']

const sort_helper = (a, b) => {
		let t_a = typeof a, t_b = typeof b
		return t_a < t_b ? -1 : t_a > t_b ? 1 : a < b ? -1 : a > b ? 1 : 0
	}

class Raku {

	constructor() {
		this.client = new NoRiak.Client()
		this.NoRiak = NoRiak
		// set(k, v) is an alias for put(k, v).
		this.set = this.put
		this.bucket = DEFAULT_BUCKET

		this.counter_bucket = DEFAULT_COUNTER_BUCKET
		this.counter_bucket_type = DEFAULT_COUNTER_BUCKET_TYPE

		this.sets_bucket = DEFAULT_SETS_BUCKET
		this.sets_bucket_type = DEFAULT_SETS_BUCKET_TYPE
	}

  getBucket(type) {
    let bucket, prepend = ''
    if (type == undefined || type == 'kv') {
      bucket = this.bucket
    } else if (type == 'counter' || type == 'counters') {
      bucket = this.counter_bucket
    } else if (type == 'sets' || type == 'set') {
      bucket = this.sets_bucket
    } else {
      bucket = DEFAULT_BUCKET
    }

    if (process.env.NODE_ENV == 'test') {
      prepend = 'test/'
    }

    return prepend + bucket
  }

	//----+
	// KV |
	//----+
	put(k, v) {
		return this.client.put({
			bucket: this.getBucket(),
			key: k,
			content: { value: JSON.stringify(v) }
		})
	} // put


	get(k) {
		return this.client.get({
				bucket: this.getBucket(),
				key: k
			})
			.then(result => {
				return result && JSON.parse(result.content[0].value.toString())
			})
	} // get

	del(k, bucket, type) {
		this.constructor.check_key(k)
    let args = {key: k}
    args.bucket = bucket || this.getBucket()
    if (type) { args.type = type }
		return this.client.del(args)
	}

	bget(bucket, k) {
		return this.client.get({
				bucket: bucket,
				key: k
			})
			.then(result => {
				return result && JSON.parse(result.content[0].value.toString())
			})
	} // get2

	bset(bucket, k, v) {
		return this.client.put({
			bucket: bucket,
			key: k,
			content: { value: JSON.stringify(v) }
		})
	} // set3

	bdel(bucket, k) {
		return this.del(k, bucket)
	}

	//----------+
	// SETS |
	//----------+

	enbuf(v) {
		const json = JSON.stringify(v) 
		return Buffer.from(json, 'utf8')
	}

	debuf(buf) {
		const v = buf.toString('utf8')
		return JSON.parse(v)
	} 

	get_sets(k) {
		this.constructor.check_key(k)
		return new NoRiak.CRDT.Set(this.client,
				{ bucket: this.getBucket('sets'),
					type: this.sets_bucket_type,
					key: k})
	}

	sismember(k, v) {
		return this.smembers(k)
			.then(values => values.includes(v))
	}

	sadd(k, ...values) {
		let s = this.get_sets(k)
		values.forEach(v => {
			s.add(this.enbuf(v))
		})
		return s.save()
	}

	srem(k, v) {
		let s = this.get_sets(k)
		return s.load()
			.then(res => {
        return res.remove(this.enbuf(v)).save()
      })
      .catch(reason => {
				if (reason.toString().match(/RiakError.*precondition.*not_present/)) {
          return -1
        }
      })
	}

	sdel(k) {
    return this.del(k, this.getBucket('sets'), this.sets_bucket_type)
	}

	smembers(k) {
		this.constructor.check_key(k)
		let s = this.get_sets(k)
		return s.load()
			.then(res => {
				return res.value()
									.map(v => this.debuf(v))
									.sort(sort_helper)
			 })
	}

	scard(k) {
		return this.smembers(k)
			.then(values => values.length)
	}

	//----------+
	// COUNTERS |
	//----------+

	get_counter(k) {
		this.constructor.check_key(k)
		return new NoRiak.CRDT.Counter(this.client,
				{ bucket: this.getBucket('counter'),
					type: this.counter_bucket_type,
					key: k})
	}

	cget(k) {
		let counter = this.get_counter(k)
		return counter.load()
			.then(counter => counter.value().toNumber())
	}

	cset(k, v) {
		return this.cget(k)
			.then(x => {
				return this.get_counter(k).increment(-x + v).save()
			})
			.then(counter => counter.value().toNumber())
	}

	cinc(k, v) {
		let counter = this.get_counter(k)
		let amount = (v == undefined) ? 1 : v
		return counter.increment(amount).save()
			.then(counter => counter.value().toNumber())
	}

	cdec(k, v) {
		let amount = (v == undefined) ? -1 : -v
		return this.cinc(k, amount)
	}

	cdel(k) {
		return this.del(k, this.getBucket('counter'), this.counter_bucket_type)
	}

	// Make sure the key is a string.
	static check_key(k) {
		if (typeof k != 'string') {
			throw new Error('The counter key must be a string.')
		}
	}

  // This is not a real bucketType API, because Riak offers only a command-line interface to managing
  //  bucket types, which requires sudo.  You should manually list the known active bucketTypes by
  //  assigning them like so:
  //
  // import Raku from 'raku'
  // Raku.KNOWN_BUCKET_TYPES = ['default', 'mysets', 'mycounters', 'etc']
  //
  // Of course, this will only change the bucket type list in the current file.
  //
  bucketTypes() {
    return Raku.KNOWN_BUCKET_TYPES
  }

  buckets(bucketType) {
    const bucketTypes = bucketType == undefined ? this.bucketTypes() : [ bucketType ]
		return Promise.all(bucketTypes.map(type => this.client.listBuckets({type})))
      .then(buckets => buckets.reduce((accum, arr, i) => {
         const typedBuckets = arr.map(bucket => ({bucket, type: bucketTypes[i]}))
         return accum.concat(typedBuckets)
       }, []))
  }

  keys(bucketType, bucket) {
    let __buckets = null

    let get_buckets = Promise.resolve([{type: bucketType, bucket}])
    if (bucketType == undefined || bucket == undefined) {
      get_buckets = this.buckets()
    }
    return get_buckets
			.then(bucket_list => {
        __buckets = bucket_list
				return Promise.all(bucket_list.map(args => this.client.listKeys(args)))
      })
      .then(keynames_by_bucket => {
        const keys = []
        __buckets.forEach((bucketData, i) => {
          const {type, bucket} = bucketData
          keynames_by_bucket[i].forEach(key => keys.push({type, bucket, key}))
        })
        return keys
     })
  }

  deleteAll(force) {
    if (!force && process.env.NODE_ENV != 'test') {
      throw 'Error Raku.deleteAll(): refused to delete all keys: must call deleteAll(true) or be in test environment.'
    }
    return this.keys() 
      .then(keyData => {
        return Promise.all(keyData.map(args => this.client.del(args)))
      })
  }

  ping() {
    return this.client.ping()
      .then(res => {
        if (res == null) {
          return 'pong'
        } else {
          return 'ping(): ' + res
        }
      })
  }
} // class Raku

Raku.DEFAULT_BUCKET = DEFAULT_BUCKET
Raku.DEFAULT_COUNTER_BUCKET = DEFAULT_COUNTER_BUCKET
Raku.DEFAULT_COUNTER_BUCKET_TYPE = DEFAULT_COUNTER_BUCKET_TYPE
Raku.DEFAULT_SETS_BUCKET = DEFAULT_SETS_BUCKET
Raku.DEFAULT_SETS_BUCKET_TYPE = DEFAULT_SETS_BUCKET_TYPE
Raku.KNOWN_BUCKET_TYPES  = KNOWN_BUCKET_TYPES 

export default Raku
