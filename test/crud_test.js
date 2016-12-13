import Raku from '../src/Raku'
import { expect } from 'chai'

const raku = new Raku()

describe('create/read/update (put/get)', () => {
  it('should be able to save integers', () => {
    return raku.put('x', 43)
      .then( () => 43 )
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

