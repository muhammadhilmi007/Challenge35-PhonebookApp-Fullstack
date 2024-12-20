const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const phonebookRoutes = require('./routes/phonebookRoutes');
const apiContact = require('./routes/apiContact');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api', phonebookRoutes);
app.use('/api', apiContact);

const PORT = process.env.PORT || 3001;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

module.exports = app;