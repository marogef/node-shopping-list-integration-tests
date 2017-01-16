const chai = require('chai');
const chaiHttp = require('chai-http');

const {
    app, runServer, closeServer
} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('Users', function () {
    // Before our tests run, we activate the server. Our `runServer`
    // function returns a promise, and we return the that promise by
    // doing `return runServer`. If we didn't return a promise here,
    // there's a possibility of a race condition where our tests start
    // running before our server has started.
    before(function () {
        return runServer();
    });

    // close server after these tests run in case
    // we have other test modules that need to
    // call `runServer`. If server is already running
    // `runServer` will error out.
    after(funciton() {
        return closeServer();
    });
    // `chai.request.get` is an asynchronous operation. When
    // using Mocha with async operations, we need to either
    // return an ES6 promise or else passa `done` callback to the
    // test that we call at the end. We prefer the first approach, so
    // we just return the chained `chai.request.get` object.
    it('should list users on GET', function () {
        return chai.request(server)
            .get('/users')
            .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');
                res.body.length.should.be.above(0);
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.have.all.keys(
                        'id', 'firstName', 'lastName', 'birthYear');
                });
            });
    });
});

describe('recipes', function () {
    it('should list items on GET', function () {
        return chai.request(server)
            .get('/recipes')
            .then(function (res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('array');

                // because we create three items on app load
                res.body.length.should.be.at.least(1);
                // each item should be an object with key/value pairs
                // for `id`, `name` and `checked`.
                const expectedKeys = ['id', 'name', 'checked'];
                res.body.forEach(function (item) {
                    item.should.be.a('object');
                    item.should.include.keys(expectedKeys);
                });
            });
    });
    //...
});

it('should add an item on POST', function () {
    const newItem = {
        name: 'coffee',
        checked: false
    };
    return chai.request(server)
        .post('/recipes')
        .send(newItem)
        .then(function (res) {
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.include.keys('id', 'name', 'checked');
            res.body.id.should.not.be.null;
            // response should be deep equal to `newItem` from above if we assign
            // `id` to it from `res.body.id`
            res.body.should.deep.equal(Object.assign(newItem, {
                id: res.body.id
            }));
        });
});
it('should update items on PUT', function () {
    const updateData = {
        name: 'foo',
        checked: true
    };
    return chai.request(server)
        // first have to get so we have an idea of object to update
        .get('/recipes')
        .then(function (res) {
            updateData.id = res.body[0].id;
            return chai.request(server)
                .put(`/recipes/${updateData.id}`)
                .send(updateData)
        })
        .then(function (res) {
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.deep.equal(updateData);
        });
});

it('should delete items on DELETE', function () {
    return chai.request(server)
        // first have to get so we have an `id` of item
        // to delete
        .get('/recipes')
        .then(function (res) {
            return chai.request(server)
                .delete(`/recipes/${res.body[0].id}`);
        })
        .then(function (res) {
            res.should.have.status(204);
        });
});
