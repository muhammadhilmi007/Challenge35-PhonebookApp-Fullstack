const Phonebook = require('../models/phonebook');
const { Op } = require('sequelize');

const phonebookController = {
  // Get all contacts with pagination, sorting and search
  getContacts: async (req, res) => {
    try {
      const { page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', name = '' } = req.query;
      const offset = (page - 1) * limit;

      const searchCondition = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${name}%` } },
          { phone: { [Op.iLike]: `%${name}%` } }
        ]
      };

      const { count, rows } = await Phonebook.findAndCountAll({
        where: searchCondition,
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        phonebooks: rows,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
        total: count
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Add new contact
  addContact: async (req, res) => {
    try {
      const { name, phone } = req.body;
      const contact = await Phonebook.create({ name, phone });
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Update contact
  updateContact: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone } = req.body;
      const contact = await Phonebook.findByPk(id);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      await contact.update({ name, phone });
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Delete contact
  deleteContact: async (req, res) => {
    try {
      const { id } = req.params;
      const contact = await Phonebook.findByPk(id);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      await contact.destroy();
      res.status(200).json({ message: 'Contact deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Update avatar
  updateAvatar: async (req, res) => {
    try {
      const { id } = req.params;
      const contact = await Phonebook.findByPk(id);
      
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Assuming we're using multer for file upload
      const photo = req.file ? `/uploads/${req.file.filename}` : contact.photo;
      await contact.update({ photo });
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = phonebookController;