import Raku from '../src/Raku'
import { expect } from 'chai'

const raku = new Raku()

describe('client handle', () => {
  describe('bucket', () => {
    it('should be set to the default bucket, "default"', () => {
      expect(raku.bucket).to.eql(Raku.DEFAULT_BUCKET)
    })

    it('set the bucket state', () => {
      raku.bucket = 'wow'
      expect(raku.bucket).to.eql('wow')
    })

  }) // describe bucket

  describe('aliases', () => {
    it('set() should be an alias to put()', () => {
      expect(raku.set).to.eql(raku.put)
    })
  }) // describe aliases
}) // describe client handle

describe('put/get', () => {
  it('should be able to save integers', () => {
    raku.bucket = 'default' //Raku.DEFAULT_BUCKET
    return raku.set('x', 43)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(43)
      })
  })

  it('should be able to save decimal numbers', () => {
    return raku.put('x', 43.99)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(43.99)
      })
  })

  it('should be able to save strings', () => {
    return raku.put('x', 'hello')
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql('hello')
      })
  })

  it('should be able to save arrays', () => {
    return raku.put('x', ['hello', 42])
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(['hello', 42])
      })
  })

  it('should be able to save associative arrays', () => {
    return raku.put('x', {'x': 'yes', '0': ['z', 2, 3], 'hello': 42})
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql({'x': 'yes', '0': ['z', 2, 3], 'hello': 42})
      })
  })

  it('should be able to save null', () => {
    return raku.put('x', null)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(null)
      })
  })

  it('NOTE: undefined is saved as null', () => {
    return raku.put('x', null)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(null)
      })
  })

  it('should be able to save an empty associative array', () => {
    return raku.put('x', {})
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql({})
      })
  })

  it('should be able to save an empty array', () => {
    return raku.put('x', [])
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql([])
      })
  })

  it('should be able to save 0 normally', () => {
    return raku.put('x', 0)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(0)
      })
  })

  it('should be able to save false normally', () => {
    return raku.put('x', false)
      .then( () => raku.get('x') )
      .then( x => {
        expect(x).to.eql(false )
      })
  })

}) // describe create (put)

describe('delete (del)', () => {

  it('should throw an error if the key  doesn\'t exist', () => {
    return raku.del('this-key-does-not-exist')
      .then( x => {
        expect(x).to.eql(null)
      })
  })

  it('should delete existing keys', () => {
    return
      raku.put('x', 'asdf')
      .then( () => raku.get('x') )
      .then( x => {
          expect(x).to.eql('asdf')
        })
      .then( () => raku.del('x') )
      .then( () => raku.get('x') )
      .then( x => {
          expect(x).to.eql(null)
        })
  }) // it
}) // describe

describe('get/set using non-default bucket state', () => {
  beforeEach(() => {
    raku.bucket = 'test_bucket2'
  })

  afterEach( () => {
    raku.bucket = Raku.DEFAULT_BUCKET
  })

  it('changing buckets should set a value in the new bucket', () => {
    const VALUE = 500
    return raku.set('x', VALUE)
      .then( () => VALUE )
      .then( () => raku.bget('test/test_bucket2', 'x') )
      .then( value => {
        expect(value).to.eql(VALUE)
      })
  })
})


describe('bset/bget', () => {
  it('should get the value at (bucket, key)', () => {
    raku.bucket = 'sfksjalfk'
    return raku.bset('test/test_walrus', 'x42', 42)
      raku.bget('test/test_walrus', 'x42')
      .then( val => {
        expect(val).to.eql(42)
      })
  })
})

describe('bdel', () => {
  it('should delete the value at (bucket, key)', () => {
    raku.bucket = 'default'
    return raku.bset('test/mighty_mouse', 'x500', 500)
      .then( () => raku.bget('test/mighty_mouse', 'x500') )
      .then( val => {
        expect(val).to.eql(500)
      })
      .then( () => raku.bdel('test/mighty_mouse', 'x500') )
      raku.bget('test/mighty_mouse', 'x500')
      .then( val => {
        expect(val).to.eql(null)
      })
  })
})

