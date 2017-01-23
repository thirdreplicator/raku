import NoRiak from 'no-riak'

const DEFAULT_BUCKET = 'default'
const DEFAULT_COUNTER_BUCKET = 'counters'
const DEFAULT_COUNTER_BUCKET_TYPE = 'counters'

class Raku {

  constructor() {
    this.client = new NoRiak.Client()
    this.NoRiak = NoRiak
    // set(k, v) is an alias for put(k, v).
    this.set = this.put
    this.bucket = DEFAULT_BUCKET

    // Cache counter handles to avoid reinitialization.
    this.counter_bucket = DEFAULT_COUNTER_BUCKET
    this.counter_bucket_type = DEFAULT_COUNTER_BUCKET_TYPE
  }

  //----+
  // KV |
  //----+
  put(k, v) {
    return this.client.put({
      bucket: this.bucket,
      key: k,
      content: { value: JSON.stringify(v) }
    })
  } // put


  get(k) {
    return this.client.get({
        bucket: this.bucket,
        key: k
      })
      .then(result => {
        return result && JSON.parse(result.content[0].value.toString())
      })
  } // get

  del(k) {
    return this.client.del({
        bucket: this.bucket,
        key: k
      })
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
    return this.client.del({
        bucket: bucket,
        key: k
      })
  }

  //----------+
  // COUNTERS |
  //----------+

  get_counter(k) {
    this.constructor.check_key(k)
    return new NoRiak.CRDT.Counter(this.client,
        { bucket: this.counter_bucket,
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
    this.constructor.check_key(k)
    return this.client.del({type: this.constructor.DEFAULT_COUNTER_BUCKET_TYPE , bucket: this.constructor.DEFAULT_COUNTER_BUCKET, key: k})
  }

  // Make sure the key is a string.
  static check_key(k) {
    if (typeof k != 'string') {
      throw new Error('The counter key must be a string.')
    }
  }

} // class Raku

Raku.DEFAULT_BUCKET = DEFAULT_BUCKET
Raku.DEFAULT_COUNTER_BUCKET = DEFAULT_COUNTER_BUCKET
Raku.DEFAULT_COUNTER_BUCKET_TYPE = DEFAULT_COUNTER_BUCKET_TYPE

export default Raku
