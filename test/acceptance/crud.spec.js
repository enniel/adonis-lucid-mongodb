'use strict'

/**
 * adonis-LucidMongo
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

/*
|--------------------------------------------------------------------------
| CRUD APPLICATION
|--------------------------------------------------------------------------
|
| Crud related tests for Adonis LucidMongo
|
*/

/* global describe, it, after, before */
const chai = require('chai')
const fold = require('adonis-fold')
const Ioc = fold.Ioc
const setup = require('./setup')
const expect = chai.expect
require('co-mocha')

describe('Crud', function () {
  before(function * () {
    yield setup.loadProviders()
    yield setup.start()

    /**
     * REQUIREMENTS
     */
    const LucidMongo = Ioc.use('Adonis/Src/LucidMongo')
    const Schema = Ioc.use('Adonis/Src/Schema')
    const Factory = Ioc.use('Adonis/Src/Factory')
    this.Factory = Factory

    /**
     * SETUP
     */
    class User extends LucidMongo {
      static get computed () {
        return ['fullName']
      }

      getFullName () {
        return `${this.firstname} ${this.lastname}`
      }
    }
    Ioc.bind('App/Model/User', function () {
      return User
    })

    class UserSchema extends Schema {
      up () {
        this.create('users', function (collection) {
          collection.increments()
          collection.string('username', 40)
          collection.string('email_address', 120)
          collection.string('password', 80)
          collection.string('firstname')
          collection.string('lastname')
          collection.timestamps()
        })
      }

      down () {
        this.drop('users')
      }
    }

    Factory.blueprint('App/Model/User', function (fake) {
      return {
        username: fake.username(),
        email_address: fake.email(),
        firstname: fake.first(),
        lastname: fake.last(),
        password: fake.password()
      }
    })

    class UserSeed {
      * run () {
        yield Factory.model('App/Model/User').create(5)
      }
    }

    /**
     * EXECUTION
    */
    this.migrations = {}
    this.migrations[new Date().getTime() + '_users'] = UserSchema

    yield setup.migrate(this.migrations, 'up')
    yield setup.seed([UserSeed])

    this.User = User
  })

  after(function * () {
    yield setup.migrate(this.migrations, 'down')
    yield setup.end()
  })

  it('should return list of all users inside the users collection', function * () {
    const users = yield this.User.all()
    expect(users.size()).to.equal(5)
    users.each((user) => {
      expect(user instanceof this.User).to.equal(true)
    })
  })

  it('should be able to create a new user inside the database', function * () {
    const user = this.Factory.model('App/Model/User').make()
    yield user.save()
    expect(user.id).not.to.equal(undefined)
    expect(user.isNew()).to.equal(false)
  })

  it('should be able to update a given user', function * () {
    const user = yield this.User.find(1)
    expect(user.isNew()).to.equal(false)
    user.email_address = 'dobby@foo.com'
    yield user.save()
    const grabUser = yield this.User.query().where('email_address', 'dobby@foo.com').first()
    expect(grabUser instanceof this.User).to.equal(true)
    expect(grabUser.id).to.equal(1)
  })

  it('should be able to delete a given user', function * () {
    const user = yield this.User.find(1)
    expect(user.isNew()).to.equal(false)
    yield user.delete()
    try {
      yield this.User.findOrFail(1)
      expect(true).to.equal(false)
    } catch (e) {
      expect(e.name).to.equal('ModelNotFoundException')
    }
  })

  it('should be able to make the user fullname using computed properties', function * () {
    const users = yield this.User.all()
    users.toJSON().forEach(function (user) {
      expect(user.fullName).to.equal(`${user.firstname} ${user.lastname}`)
    })
  })
})
