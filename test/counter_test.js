import Raku from '../src/Raku'
import { expect } from 'chai'

const raku = new Raku()

describe('counter operations', () => {
  // Default counter bucket type
  describe('default counter bucket type', () => {
    // get
    it('should already be initialized', () => {
      expect(raku.counter_bucket_type).to.not.be.undefined
      expect(raku.counter_bucket_type).to.eql(Raku.DEFAULT_COUNTER_BUCKET_TYPE)
    })

    // set
    it('set the bucket type for counters', () => {
      raku.counter_bucket_type = 'test_counter_bucket_type_000'
      expect(raku.counter_bucket_type).to.eql('test_counter_bucket_type_000')

      // reset to normal initialized state
      raku.counter_bucket_type = Raku.DEFAULT_COUNTER_BUCKET_TYPE
    })
  })

  // Default counter bucket
  describe('default counter bucket', () => {
    // get
    it('should already be initialized', () => {
      expect(raku.counter_bucket).to.not.be.undefined
      expect(raku.counter_bucket).to.eql(Raku.DEFAULT_COUNTER_BUCKET)
    })

    // set
    it('set the bucket for counters', () => {
      raku.counter_bucket = 'test_counter_bucket_000'
      expect(raku.counter_bucket).to.eql('test_counter_bucket_000')

      // reset to normal initialized state
      raku.counter_bucket = Raku.DEFAULT_COUNTER_BUCKET
    })
  })

  // get

  describe('cget(key)', () => {
    it('should throw an error if the first argument is not a string', () => {
      expect(() => {
        raku.cget()
      }).to.throw(/key must be a string/i)
    })

  /* Remove this test until I figure out how to delete a CRDT COUNTER key and
   *   start from scratch.
   */
  //  it('should be 0 to begin with', () => {
  //    return raku.cget('test_counter')
  //      .then(val => expect(val).to.eql(0))
  //  })
  })

  // set
  describe('cset(key, value)', () => {
    it('should throw an error if the first argument is not a string', () => {
      expect(() => {
        raku.cset(0)
      }).to.throw(/key must be a string/i)
    })

    it('should be able to store an integer', () => {
      return raku.cset('test_counter', 0)
        .then(val => expect(val).to.eql(0)) // in-memory value
        .then(() => raku.cget('test_counter'))
        .then(val => expect(val).to.eql(0)) // database loaded value
    })
  })

  // increment
  describe('raku.cinc(key)', () => {
    it('should throw an error if the first argument is not a string', () => {
      expect(() => {
        raku.cinc()
      }).to.throw(/key must be a string/i)
    })

    it('should increment the counter by one if no amount is provided', () => {
      return raku.cset('test_counter', 0)
        .then(() => raku.cinc('test_counter'))
        .then(val => expect(val).to.eql(1))
    })

    it('should increment the counter by n if provided as an argument', () => {
      return raku.cset('test_counter', 0)
        .then(() => raku.cinc('test_counter', 5))
        .then(val => expect(val).to.eql(5)) // in-memory value
        .then(() => raku.cget('test_counter'))
        .then(val => expect(val).to.eql(5)) // database loaded value
    })
  })

  // decrement
  describe('raku.cdec(key)', () => {
    it('should throw an error if the first argument is not a string', () => {
      expect(() => {
        raku.cdec()
      }).to.throw(/key must be a string/i)
    })

    it('should decrement the counter by one if no amount is provided', () => {
      return raku.cset('test_counter', 50)
        .then(() => raku.cdec('test_counter'))
        .then(val => expect(val).to.eql(49)) // in-memory value
        .then(() => raku.cget('test_counter'))
        .then(val => expect(val).to.eql(49)) // database loaded value
    })

    it('should deccrement the counter by n if provided as an argument', () => {
      return raku.cset('test_counter', -100)
        .then(() => raku.cdec('test_counter', 5))
        .then(val => expect(val).to.eql(-105)) // in-memory value
        .then(() => raku.cget('test_counter'))
        .then(val => expect(val).to.eql(-105)) // database loaded value
    })
  })

}) // describe counter operations (cset, cget, cinc, cdec)
