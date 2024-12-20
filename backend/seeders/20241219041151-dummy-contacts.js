"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */

    await queryInterface.bulkInsert(
      "Contacts",
      [
        {
          name: "Felix",
          phone: "08123456789",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "John",
          phone: "081122334455",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Uchiha",
          phone: "082233445566",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sasuke",
          phone: "089966552331",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Naruto",
          phone: "081133445588",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sinchan",
          phone: "99886622331144",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Nobita",
          phone: "77885566331122",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Suneo",
          phone: "88995522446633",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Doraemon",
          phone: "33221144556688",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Giant",
          phone: "889955441122233",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Abdul",
          phone: "081234567812",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rafi",
          phone: "0811223344556",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Tia",
          phone: "0822334455667",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Raka",
          phone: "0899665523318",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Nadia",
          phone: "0811334455889",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Siti",
          phone: "998866223311445",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rosa",
          phone: "778855663311226",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sofia",
          phone: "889955224466337",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Nisa",
          phone: "332211445566889",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Rahma",
          phone: "8899554411222338",
          photo: "/user-avatar.svg",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("Contacts", null, {});
  },
};
