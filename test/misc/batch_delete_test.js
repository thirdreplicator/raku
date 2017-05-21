// test/batch_delete_test.js
import Raku from '../../src/Raku'
import { expect, assert } from 'chai'

const raku = new Raku()

// Note: This is a very dangerous operation. It should only be used in
//  a test or development environment.
describe('Batch delete', function() {

	beforeEach(() => raku.delete_all())

  describe('Rraku.delete_all()', function() {
    it('should delete kv keys in the default bucket', async () => {
      // The database should be empty.
      const before = await raku.keys()
      expect(before).to.eql([])

      // Add a KV key
      await raku.put('x1', 1)
      const after = await raku.keys()
      expect(after[0].key).to.eql('x1')

      // Clear the whole database.
			await raku.delete_all()
      const afterDelete = await raku.keys()
      expect(afterDelete).to.eql([])
    })

    it('should delete kv keys in the other buckets', async () => {
      // The database should be empty.
      const before = await raku.keys()
      expect(before).to.eql([])

      // Add a KV key
      await raku.bset('myBucket', 'a', 1)
      await raku.bset('myOtherBucket', 'b', 1)

      const afterSetup = await raku.keys()
      expect(afterSetup.map(o => o.key).sort()).to.eql(['a', 'b'])

      // Clear the whole database.
			await raku.delete_all()
      const afterDelete = await raku.keys()
      expect(afterDelete).to.eql([])
    })

    it('should delete keys in CRDT counters bucket type', async () => {
      // The database should be empty.
      const before = await raku.keys()
      expect(before).to.eql([])

      // Add a KV key
      await raku.bset('myBucket', 'a', 1)
      await raku.bset('myOtherBucket', 'b', 1)

      // Add some counters
      await raku.cinc('c1')
      await raku.cinc('c2')

      const afterSetup = await raku.keys()
      expect(afterSetup.map(o => o.key).sort()).to.eql(['a', 'b', 'c1', 'c2'])

      // Clear the whole database.
			await raku.delete_all()
      const afterDelete = await raku.keys()
      expect(afterDelete).to.eql([])
    })

    it('should delete keys in CRDT sets bucket type', async () => {
      // The database should be empty.
      const before = await raku.keys()
      expect(before).to.eql([])

      // Add some sets
      await raku.sadd('s1', 100)
      await raku.sadd('s2', 200)

      const afterSetup = await raku.keys()
      expect(afterSetup.map(o => o.key).sort()).to.eql(['s1', 's2'])

      // Clear the whole database.
			await raku.delete_all()
      const afterDelete = await raku.keys()
      expect(afterDelete).to.eql([])
    })
  }) // describe
}) // describe batch delete
