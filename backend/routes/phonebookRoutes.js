const express = require('express');
const router = express.Router();
const phonebookController = require('../controllers/phonebookController');
const upload = require('../middleware/upload');

router.get('/phonebooks', phonebookController.getContacts);
router.post('/phonebooks', phonebookController.addContact);
router.put('/phonebooks/:id', phonebookController.updateContact);
router.delete('/phonebooks/:id', phonebookController.deleteContact);
router.put('/phonebooks/:id/avatar', upload.single('photo'), phonebookController.updateAvatar);

module.exports = router;