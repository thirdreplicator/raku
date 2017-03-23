// test/bucket_types_test.js

import Raku from '../../src/Raku'
import { expect, assert } from 'chai'

const raku = new Raku()

// Manage known bucket types.
describe('Batch types', () => {

  beforeEach(() => raku.deleteAll())

  describe('Raku.bucketTypes()', () => {
    it('should have some reasonable default values', () => {
      expect(raku.bucketTypes()).to.eql(['default', 'sets', 'counters'])
      expect(raku.bucketTypes()).to.eql(Raku.KNOWN_BUCKET_TYPES)
    })

    it('Raku.KNOWN_BUCKET_TYPES should be assignable', () => {
      Raku.KNOWN_BUCKET_TYPES = ['default', 'sets', 'counters', 'myBucketType']
      expect(raku.bucketTypes()).to.eql(['default', 'sets', 'counters', 'myBucketType'])

      // Reset it back to defaults so that other tests don't get messed up.
      Raku.KNOWN_BUCKET_TYPES = ['default', 'sets', 'counters']
    })
  }) // describe Raku.bucketTypes()
})
