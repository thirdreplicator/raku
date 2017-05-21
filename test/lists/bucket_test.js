// test/bucket_test.js
import Raku from '../../src/Raku'
import { expect, assert } from 'chai'
import { expectSetEquality } from '../helpers'

const raku = new Raku()

describe('Bucket listing', () => {
  beforeEach(() => raku.delete_all())

	// List the known buckets given a bucket type.
  describe('raku.buckets(bucketType)', () => {
    it('should return a list of buckets within the given bucketType', async () => {
      let actual = null
      let expected = [
						{ type: 'counters',
							bucket: 'test/IDS'},
						{ type: 'counters',
							bucket: 'test/counters'}]
      expect(raku.counter_bucket).to.eql('counters')
      raku.counter_bucket = 'IDS'
      await raku.cinc('Person:last_id') 
      await raku.cinc('Person:last_id') 
      await raku.cinc('Articles:last_id') 
      await raku.cinc('Comments:last_id') 

      raku.counter_bucket = 'counters'
      await raku.cinc('Person#42:num_failed_logins') 
      await raku.cinc('Article#500:num_reads') 
      await raku.cinc('Comment#500:num_views') 
      
      return raku.buckets('counters')
        .then(buckets => {
					expectSetEquality(buckets, expected)
        })
        .then(_ => raku.counter_bucket = 'counters')
    })
  }) //

	// List the known buckets for all known bucket types.
  describe('raku.buckets()',  () => {
    it('should list all known buckets (for the known bucketTypes)', async () => {
      let expected = [
          { type: 'default',
            bucket: 'test/default'},
          { type: 'default',
            bucket: 'test/articles'},
          { type: 'default',
            bucket: 'test/people'},
          { type: 'counters',
            bucket: 'test/counters'},
          { type: 'counters',
            bucket: 'test/LAST_IDS'},
          { type: 'sets',
            bucket: 'test/sets'},
				]
      raku.bucket = 'articles'
      await raku.put('hello', 'how are you?')
      await raku.put('x', 500)

      raku.bucket = 'people'
      await raku.put('david', 'beckwith')
      await raku.put('love', 'beckwith')

      raku.bucket = 'default'
      await raku.put('y', 100)
      await raku.put('z', 5000)

      raku.counter_bucket = 'LAST_IDS'
      await raku.cinc('Person:last_id') 
      await raku.cinc('Person:last_id') 
      await raku.cinc('Articles:last_id') 
      await raku.cinc('Comments:last_id') 

      raku.counter_bucket = 'counters'
      await raku.cinc('Person#42:num_failed_logins') 
      await raku.cinc('Article#500:num_reads') 
      await raku.cinc('Comment#500:num_views') 
      
      raku.sets_bucket = 'sets'
      await raku.sadd('Comment#500:post_ids', 1000) 
      await raku.sadd('Comment#42:post_ids', 1001) 

      return raku.buckets()
        .then(buckets => {
					expectSetEquality(buckets, expected)
        })
    })
  })

}) // describe listing buckets
