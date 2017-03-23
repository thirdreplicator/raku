import Raku from '../../src/Raku'
import { expect } from 'chai'

const raku = new Raku()

describe('ping', () => {
  it('should return "pong" when the server is up.', () => {
    return raku.ping()
      .then(function(result) {
        expect(result).to.eql('pong')
      })
  })

  it('should throw an error when the server is down.', () => {
    raku.ping = () => Promise.reject( new Error('No Riak connections available: all hosts down') )
    return raku.ping()
      .catch(e => expect(e.toString()).to.eql('Error: No Riak connections available: all hosts down'))
  })
}) // describe
