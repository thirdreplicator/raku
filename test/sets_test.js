import Raku from '../src/Raku'
import { expect, assert } from 'chai'
const raku = new Raku()

describe('CRDT sets', () => {
	// Default sets bucket type
	describe('default set bucket type', () => {
		// get
		it('should already be initialized', () => {
			expect(raku.sets_bucket_type).to.not.be.undefined
			expect(raku.sets_bucket_type).to.eql(Raku.DEFAULT_SETS_BUCKET_TYPE)
		})

		// set
		it('set the bucket type for sets ', () => {
			raku.sets_bucket_type = 'test_sets_bucket_type_000'
			expect(raku.sets_bucket_type).to.eql('test_sets_bucket_type_000')

			// reset to normal initialized state
			raku.sets_bucket_type = Raku.DEFAULT_SETS_BUCKET_TYPE
		})
	})

	// Default sets bucket
	describe('default sets bucket', () => {
		// get
		it('should already be initialized', () => {
			expect(raku.sets_bucket).to.not.be.undefined
			expect(raku.sets_bucket).to.eql(Raku.DEFAULT_SETS_BUCKET)
		})

		// set
		it('set the bucket for sets', () => {
			raku.sets_bucket = 'test_sets_bucket_000'
			expect(raku.sets_bucket).to.eql('test_sets_bucket_000')

			// reset to normal initialized state
			raku.sets_bucket = Raku.DEFAULT_SETS_BUCKET
		})
	})

	// is member ?

	describe('sismember(key, value)', () => {
		it('should throw an error if the first argument is not a string', () => {
			expect(() => {
				raku.cget()
			}).to.throw(/key must be a string/i)
		})

		it('should be false to begin with', () => {
			return raku.client.del({ type: Raku.DEFAULT_SETS_BUCKET_TYPE,
															 bucket: 'test/' + Raku.DEFAULT_SETS_BUCKET,
															 key: 'test_sets'})
					.then(() => raku.sismember('test_sets', 'hello'))
					.then(val => expect(val).to.be.false)
					.then(() => raku.sismember('test_sets', 0))
					.then(val => expect(val).to.be.false)
		})

		it('should return true if the item is a member of the set', () => {
			var set = new raku.NoRiak.CRDT.Set(raku.client, {
						bucket: 'test/' + Raku.DEFAULT_SETS_BUCKET,
						type: Raku.DEFAULT_SETS_BUCKET_TYPE,
						key: 'test_sets'
				});
			return raku.client.del({ type: Raku.DEFAULT_SETS_BUCKET_TYPE,
															 bucket: 'test/' + Raku.DEFAULT_SETS_BUCKET,
															 key: 'test_sets',
															 strings: true })
				.then(() => set.add(JSON.stringify('hello')).save())
					.then(() => raku.sismember('test_sets', 'hello'))
					//.then(() => set.add(501).save())
					//.then(() => raku.sismember('test_sets', 501))
		})
	})

	// add an element
	describe('sadd(key, value)', () => {
		it('should throw an error if the first argument is not a string', () => {
			expect(() => {
				raku.sadd(0)
			}).to.throw(/key must be a string/i)
		})

		it('should be able to store an integer', () => {
			return raku.sadd('test_sets', 0)
				.then(() => raku.sismember('test_sets', 0))
				.then(val => expect(val).to.be.true) // database loaded value
		})

		it('should be able to store a string', () => {
			return raku.sadd('test_sets', 'hello')
				.then(() => raku.sismember('test_sets', 'hello'))
				.then(val => expect(val).to.be.true) // database loaded value
		})
	})

	// remove an element
	describe('raku.srem(key, value)', () => {
		it('should throw an error if the first argument is not a string', () => {
			expect(() => {
				raku.srem()
			}).to.throw(/key must be a string/i)
		})

		it('should remove the member from the set', () => {
			return raku.sadd('test_sets', 510)
				.then(() => raku.sismember('test_sets', 510))
				.then(val => expect(val).to.be.true)
				.then(() => raku.srem('test_sets', 510))
				.then(() => raku.sismember('test_sets', 510))
				.then(val => expect(val).to.be.false)
		})
	})

	// delete the whole set
	describe('raku.sdel(key)', () => {
		it('should remove all values of the set', () => {
			 return raku.sadd('test_sets', 1000)
				 .then(() => raku.sadd('test_sets', 'hello'))
				 .then(() => raku.sismember('test_sets', 1000))
				 .then(res => expect(res).to.be.true)
				 .then(() => raku.sismember('test_sets', 'hello'))
				 .then(res => expect(res).to.be.true)
				 .then(() => raku.sdel('test_sets'))
				 .then(() => raku.sismember('test_sets', 1000))
				 .then(res => expect(res).to.be.false)
				 .then(() => raku.sismember('test_sets', 'hello'))
				 .then(res => expect(res).to.be.false)
		})
	})

	// list members
	describe('raku.smembers(key)', () => {
		it('should throw an error if the first argument is not a string', () => {
			expect(() => {
				raku.smembers(0)
			}).to.throw(/key must be a string/i)
		})

		it('should return an array with all the members', () => {
			let s0 = [42, 50, 100, 'hello']
			return raku.sdel('test_sets')
				.then(() => raku.sadd('test_sets', ...s0))
				.then(() => raku.smembers('test_sets'))
				.then(s1 => expect(s1).to.eql(s0))
		})
	}) // smembers

	describe('raku.smembers(key)', () => {
		it('should return the number of membrs in the set', () => {
			let s0 = [42, 50, 100, 'hello']
			return raku.sdel('test_sets')
				.then(() => raku.sadd('test_sets', ...s0))
				.then(() => raku.scard('test_sets'))
				.then(res => expect(res).to.eql(s0.length))
			
		})
	}) // scard
}) // describe sets operations (sadd, sismember, srem, sdel, smemembers)
