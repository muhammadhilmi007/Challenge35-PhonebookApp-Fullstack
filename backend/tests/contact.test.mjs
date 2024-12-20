import * as chai from "chai";
import chaiHttp from "chai-http";
import path from "path";
import { fileURLToPath } from "url";
chai.should();
import app from "../server.js";
import Contacts from "../models/contacts.js"; // Contacts is already imported here
const request = chai.use(chaiHttp).request;

const { contact } = Contacts;

describe("Contacts API", function () {
    before(async function () {
        // Creating a test contact before running tests
        try {
            await Contacts.create({
                name: 'Test Unit Mocha Chai',
                phone: '08123456789'
            });
        } catch (err) {
            console.log(err);
        }
    });

    it("seharusnya menampilkan contact denga pagination, sorting secara ascending, dan pencarian dengan GET method", function (done) {
      request
        .execute(app)
        .get("/api/contacts")
        .query({
          name: "Test",
          page: 1,
          limit: 5,
          sortBy: "name",
          sortOrder: "asc",
        })
        .end((err, res) => {
          if (err) throw err;
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.contacts.should.be.an("array");
          res.body.contacts[0].should.be.an("object");
          res.body.contacts[0].should.have.property("id");
          res.body.contacts[0].should.have.property("name");
          res.body.contacts[0].should.have.property("phone");
          res.body.contacts[0].should.have.property("photo");
          res.body.contacts[0].name.should.equal("Test Unit Mocha Chai");
          res.body.contacts[0].phone.should.equal("08123456789");
          done();
        });
    });

  it("seharusnya menampilkan contact dengan pagination, sorting secara descending, dan pencarian dengan GET method", function (done) {
    request
      .execute(app)
      .get("/api/contacts")
      .query({
        name: "Test",
        page: 1,
        limit: 5,
        sortBy: "name",
        sortOrder: "desc",
      })
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.contacts.should.be.an("array");
        res.body.contacts[0].should.be.an("object");
        res.body.contacts[0].should.have.property("id");
        res.body.contacts[0].should.have.property("name");
        res.body.contacts[0].should.have.property("phone");
        res.body.contacts[0].should.have.property("photo");
        res.body.contacts[0].name.should.equal("Test Unit Mocha Chai");
        res.body.contacts[0].phone.should.equal("08123456789");
        done();
      });
  });

  it("seharusnya menampilkan semua kontak dengan GET method", function (done) {
    request
      .execute(app)
      .get("/api/contacts")
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.contacts.should.be.an("array");
        res.body.contacts[0].should.be.an("object");
        res.body.contacts[0].should.have.property("id");
        res.body.contacts[0].should.have.property("name");
        res.body.contacts[0].should.have.property("phone");
        res.body.contacts[0].should.have.property("photo");
        res.body.contacts[0].name.should.equal("Abdul");
        done();
      });
  });

  it("seharusnya menampilkan kontak dengan ID tertentu dengan GET method", function (done) {
    request
      .execute(app)
      .get("/api/contacts/1")
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("id");
        res.body.should.have.property("name");
        res.body.should.have.property("phone");
        res.body.should.have.property("photo");
        res.body.name.should.equal("Felix");
        done();
      });
  });

  it("seharusnya menambahkan kontak dengan POST method", function (done) {
    request
      .execute(app)
      .post("/api/contacts")
      .send({
        name: "Test Contact",
        phone: "0812345678910",
        photo: "/user-avatar.svg",
      })
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be.an("object");
        res.body.should.have.property("name");
        res.body.should.have.property("phone");
        res.body.should.have.property("photo");
        res.body.name.should.equal("Test Contact");
        res.body.phone.should.equal("0812345678910");
        res.body.photo.should.equal("/user-avatar.svg");
        done();
      });
  });

  it("seharusnya memperbarui kontak dengan PUT method", function (done) {
    request
      .execute(app)
      .put("/api/contacts/1")
      .send({
        name: "Updated Contact",
        phone: "0812345678911",
        photo: "/user-avatar.svg",
      })
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(201);
        res.should.be.an("object");
        res.body.should.be.an("object");
        res.body.should.have.property("name");
        res.body.should.have.property("phone");
        res.body.should.have.property("photo");
        res.body.name.should.equal("Updated Contact");
        res.body.phone.should.equal("0812345678911");
        res.body.photo.should.equal("/user-avatar.svg");
        done();
      });
  });

  it("seharusnya menghapus kontak dengan DELETE method", function (done) {
    request
      .execute(app)
      .delete("/api/contacts/2")
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(200);
        res.should.be.an("object");
        res.body.should.be.an("object");
        res.body.should.have.property("message");
        res.body.message.should.equal("Contact deleted successfully");
        done();
      });
  });

  it("seharusnya memperbarui avatar dengan PUT method", function (done) {
    const filePath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "test-avatar.jpg"
    );
    request
      .execute(app)
      .put("/api/contacts/1/avatar")
      .attach("photo", filePath)
      .end((err, res) => {
        if (err) throw err;
        res.should.have.status(201);
        res.body.should.be.an("object");
        res.body.should.have.property("photo");
        res.body.photo.should.include("/uploads/");
        done();
      });
  });

  // after(async () => {
  //   await Contacts.destroy({
  //     truncate: true,
  //     cascade: false,
  //     restartIdentity: true,
  //   });
  // });
  
});
