import Raku from '../src/Raku'
import { expect } from 'chai'

const raku = new Raku()

describe('ping', () => {
  it('should return null when the server is up.', () => {
    return raku.client.ping()
      .then(function(result) {
        expect(result).to.eql(null)
      })
  })
})
