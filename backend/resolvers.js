const { Op } = require('sequelize');
const { finished } = require('stream/promises');
const fs = require('fs');
const path = require('path');
const Phonebook = require('./models/phonebook');

// Helper function to process file upload
async function processUpload(file) {
  const { createReadStream, filename } = await file;
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const uniqueFilename = uniqueSuffix + '-' + filename;
  const uploadDir = path.join(__dirname, 'uploads');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const out = path.join(uploadDir, uniqueFilename);
  const stream = createReadStream();
  const writeStream = fs.createWriteStream(out);
  
  stream.pipe(writeStream);
  await finished(writeStream);
  
  return `/uploads/${uniqueFilename}`;
}

const resolvers = {
  Query: {
    contacts: async (_, { page = 1, limit = 10, search = '', sortBy = 'name', sortOrder = 'asc' }) => {
      try {
        const offset = (page - 1) * limit;
        const where = search ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { phone: { [Op.iLike]: `%${search}%` } },
          ]
        } : {};

        const { count, rows } = await Phonebook.findAndCountAll({
          where,
          order: [[sortBy, sortOrder.toUpperCase()]],
          limit,
          offset
        });

        return {
          contacts: rows,
          total: count,
          page,
          pages: Math.ceil(count / limit)
        };
      } catch (error) {
        throw new Error('Error fetching contacts: ' + error.message);
      }
    },

    contact: async (_, { id }) => {
      try {
        const contact = await Phonebook.findByPk(id);
        if (!contact) throw new Error('Contact not found');
        return contact;
      } catch (error) {
        throw new Error('Error fetching contact: ' + error.message);
      }
    }
  },

  Mutation: {
    addContact: async (_, { name, phone }) => {
      try {
        const contact = await Phonebook.create({
          name,
          phone
        });
        return contact;
      } catch (error) {
        throw new Error('Error creating contact: ' + error.message);
      }
    },

    updateContact: async (_, { id, ...updates }) => {
      try {
        const contact = await Phonebook.findByPk(id);
        if (!contact) throw new Error('Contact not found');
        
        await contact.update(updates);
        return contact;
      } catch (error) {
        throw new Error('Error updating contact: ' + error.message);
      }
    },

    deleteContact: async (_, { id }) => {
      try {
        const contact = await Phonebook.findByPk(id);
        if (!contact) throw new Error('Contact not found');
        
        await contact.destroy();
        return true;
      } catch (error) {
        throw new Error('Error deleting contact: ' + error.message);
      }
    },

    uploadPhoto: async (_, { id, file }) => {
      try {
        const contact = await Phonebook.findByPk(id);
        if (!contact) {
          throw new Error('Contact not found');
        }

        // Process file upload
        const photoPath = await processUpload(file);
        
        // Update contact with new photo path
        await contact.update({ photo: photoPath });
        
        return contact;
      } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
      }
    }
  }
};

module.exports = resolvers;