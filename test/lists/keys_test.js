// test/list_keys_test.js
import Raku from '../../src/Raku'
import { expect } from 'chai'
import { expectSetEquality } from '../helpers'

const raku = new Raku()

describe('List keys', () => {
  beforeEach(() => raku.deleteAll())

  describe('List keys: raku.keys(bucketType, bucket)', () => {
    it('should return a list of keys in a bucket with the given bucketType', async () => {
      const inc_k1 = raku.cinc('k1'), // counter
        inc_k2 = raku.cinc('k2'), // counter
        put_d1 = raku.put('d1', 42), // KV
        sadd_s1 = raku.sadd('s1', 100) // sets
      let expected = [
						{ key: 'k1',
              type: 'counters',
							bucket: 'test/counters'},
						{ key: 'k2',
              type: 'counters',
							bucket: 'test/counters'}]
      await Promise.all([inc_k1, inc_k2, put_d1, sadd_s1])
      let keys = await raku.keys('counters', 'test/counters')
			expectSetEquality(keys, expected)
    }) // it
  }) // describe

  describe('List all keys in all buckets: raku.keys()', () => {
    it('should return all keys in all bucket/bucketTypes', async () => {
      const inc_k1 = raku.cinc('k1'), // counter
        inc_k2 = raku.cinc('k2'), // counter
        put_d1 = raku.put('d1', 42), // KV
        sadd_s1 = raku.sadd('s1', 100) // sets
      let expected = [
            { key: 'd1',
              type: 'default',
              bucket: 'test/default'},
						{ key: 'k1',
              type: 'counters',
							bucket: 'test/counters'},
						{ key: 'k2',
              type: 'counters',
							bucket: 'test/counters'},
            { key: 's1',
              type: 'sets',
              bucket: 'test/sets' }]
      await Promise.all([inc_k1, inc_k2, put_d1, sadd_s1])
      let keys = await raku.keys()
			expectSetEquality(keys, expected)
    }) // it
  }) // describe
}) // describe
