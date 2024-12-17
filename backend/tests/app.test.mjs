import * as chai from 'chai';
import chaiHttp from 'chai-http';
chai.should();
import app from '../server.js';
import Phonebook from '../models/phonebook.js';  // Phonebook is already imported here
const request = chai.use(chaiHttp).request.execute(app);


describe('Phonebook API', function () {

    // before(function (done) {
    //     // Creating a test contact before running tests
    //     Phonebook.create({
    //         id: 1,
    //         name: 'Test User',
    //         phone: '08123456789'
    //     }).then(function (contact) {
    //         console.log(contact);
    //         done();
    //     }).catch(() => {
    //         done();
    //     });
    // });

    // after(function (done) {
    //     // Clean up: Destroy all phonebook entries after tests
    //     Phonebook.destroy({ where: {
    //         id: 1
    //     } }).then(function () {
    //         done();
    //     }, () => {
    //         done();
    //     });
    // });

    it('should display all contacts with GET method', async function () {
        await Phonebook.create({
            name: 'Test User',
            phone: '08123456789',
            photo: 'https://example.com/photo.jpg'
        });

        const res = await request.get('/api/phonebooks');
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.phonebooks.should.be.an('array');
        res.body.phonebooks[0].should.be.an('object');
        res.body.phonebooks[0].should.have.property('id');
        res.body.phonebooks[0].should.have.property('name', 'Test User');
        res.body.phonebooks[0].should.have.property('phone', '08123456789');
        res.body.phonebooks[0].should.have.property('photo', 'https://example.com/photo.jpg');
    });

    it('should create a new contact with POST method', async function () {
        const newContact = {
            name: 'New User',
            phone: '087654321',
            photo: 'https://example.com/newphoto.jpg'
        };

        const res = await request.post('/api/phonebooks').send(newContact);
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('name', newContact.name);
        res.body.should.have.property('phone', newContact.phone);
        res.body.should.have.property('photo', newContact.photo);

        const savedContact = await Phonebook.findOne({ where: { name: newContact.name } });
        savedContact.should.exist;
        savedContact.phone.should.equal(newContact.phone);
        savedContact.photo.should.equal(newContact.photo);
    });

    it('should update a contact with PUT method', async function () {
        const contact = await Phonebook.create({
            name: 'User to Update',
            phone: '081234567',
            photo: 'https://example.com/oldphoto.jpg'
        });

        const updatedContact = {
            name: 'Updated User',
            phone: '089999999',
            photo: 'https://example.com/updatedphoto.jpg'
        };

        const res = await request.put(`/api/phonebooks/${contact.id}`).send(updatedContact);
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('name', updatedContact.name);
        res.body.should.have.property('phone', updatedContact.phone);
        res.body.should.have.property('photo', updatedContact.photo);

        const updatedInDb = await Phonebook.findByPk(contact.id);
        updatedInDb.name.should.equal(updatedContact.name);
        updatedInDb.phone.should.equal(updatedContact.phone);
        updatedInDb.photo.should.equal(updatedContact.photo);
    });

    it('should delete a contact with DELETE method', async function () {
        const contact = await Phonebook.create({
            name: 'User to Delete',
            phone: '087654321',
            photo: 'https://example.com/delphoto.jpg'
        });

        const res = await request.delete(`/api/phonebooks/${contact.id}`);
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('message', 'Contact deleted successfully');

        const deletedContact = await Phonebook.findByPk(contact.id);
        should.not.exist(deletedContact);
    });
});
