import NoRiak from 'no-riak'

const DEFAULT_BUCKET = 'default'

class Raku {
  constructor() {
    this.client = new NoRiak.Client()
    this.NoRiak = NoRiak
  }

  put(k, v) {
    return this.client.put({
      bucket: DEFAULT_BUCKET,
      key: k,
      content: { value: JSON.stringify(v) }
    })
  } // put

  get(k) {
    return this.client.get({
        bucket: DEFAULT_BUCKET,
        key: k
      })
      .then(result => {
        return result && JSON.parse(result.content[0].value.toString())
      })
  } // get

  del(k) {
    return this.client.del({
        bucket: DEFAULT_BUCKET,
        key: k
      })
  }

} // Raku

export default Raku
