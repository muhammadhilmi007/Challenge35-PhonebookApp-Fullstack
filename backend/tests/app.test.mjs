import * as chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../server.js';
import Phonebook from '../models/phonebook.js';  // Phonebook is already imported here

const request = chai.use(chaiHttp).request.execute(app);
chai.should();

describe('Phonebook API', function () {

    before(function (done) {
        // Creating a test contact before running tests
        Phonebook.create({
            id: 1,
            name: 'Test User',
            phone: '08123456789'
        }).then(function (contact) {
            console.log(contact);
            done();
        }).catch(() => {
            done();
        });
    });

    after(function (done) {
        // Clean up: Destroy all phonebook entries after tests
        Phonebook.destroy({ where: {
            id: 1
        } }).then(function () {
            done();
        }, () => {
            done();
        });
    });

    it('should get all contacts with pagination', function (done) {
        request.execute(app).get('/api/phonebooks').end(function (err, res) {
                if (err) throw err;
                res.should.have.status(200);
                res.body.should.be.an('object');
                res.body.phonebooks.should.be.an('array');
                res.body.should.be.an('object');
                res.body.should.have.property('id');
                res.body.should.have.property('name');
                res.body.should.have.property('phone');
                res.body.id.should.equal(1);
                res.body.name.should.equal('Test User');
                res.body.phone.should.equal('08123456789');
                done();
            });
    });

    it('should create a new contact', function (done) {
        request.execute(app).post('/api/phonebooks').send({
            name: 'Test Belajar',
            phone: '08123456789'
        }).end(function (err, res) {
                if (err) throw err;
                res.should.have.status(201);
                res.body.should.be.an('object');
                res.body.should.have.property('id');
                res.body.should.have.property('name');
                res.body.should.have.property('phone');
                res.body.id.should.equal(1);
                res.body.name.should.equal('Test User');
                res.body.phone.should.equal('08123456789');
                done();
            });
    });
});
