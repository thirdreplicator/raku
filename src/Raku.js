import NoRiak from 'no-riak'

const DEFAULT_BUCKET = 'default'

class Raku {

  constructor() {
    this.client = new NoRiak.Client()
    this.NoRiak = NoRiak
    // set(k, v) is an alias for put(k, v).
    this.set = this.put
    this.bucket = DEFAULT_BUCKET
  }


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

  bdel(k) {
    return this.client.del({
        bucket: this.bucket,
        key: k
      })
  }

  static get DEFAULT_BUCKET() {
    return DEFAULT_BUCKET
  }
} // Raku

export default Raku
