const express = require('express');
const router = express.Router();
const Contacts = require('../models/contacts');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const upload = require('../middleware/upload');

router.get('/contacts', async (req, res) => {
  try {
    const { page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', name = '' } = req.query;
    const offset = (page - 1) * limit;
    const searchCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${name}%` } },
        { phone: { [Op.iLike]: `%${name}%` } }
      ]
    };
    const { count, rows } = await Contacts.findAndCountAll({
      where: searchCondition,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json({
      contacts: rows,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/contacts/:id', async (req, res) => {
   try {
    const contacts = await Contacts.findByPk(req.params.id);
    if (!contacts) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contacts);
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
});

router.post('/contacts', async (req, res) => {
   try {
      const { name, phone } = req.body;
    const contacts = await Contacts.create({ name, phone });
    res.status(201).json(contacts);
   } catch (error) {
    res.status(400).json({ error: error.message });
   }
});

router.put('/contacts/:id', async function (req, res) {
   try {
      const { id } = req.params;
      const { name, phone } = req.body;
    const contacts = await Contacts.update({ name, phone }, {
      where: { id },
      returning: true,
      plain: true
    });
    res.status(201).json(contacts[1]);
   } catch (error) {
    res.status(400).json({ error: error.message });
   }
});

router.delete('/contacts/:id', async function (req, res) {
   try {
      const { id } = req.params;
    const contacts = await Contacts.destroy({ where: { id } });
    res.status(200).json({ message: 'Contact deleted successfully' });
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
});

router.put('/contacts/:id/avatar', upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contacts.findByPk(id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (contact.photo && contact.photo !== '/user-avatar.svg') {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', path.basename(contact.photo));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const photo = `/uploads/${req.file.filename}`;
    const updatedContact = await contact.update({ photo });
    res.status(201).json(updatedContact);
  } catch (error) {
    console.error('Avatar update error:', error);
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;