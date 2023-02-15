const express = require('express')
const db = require('./config/connection')
const routes = require('./routes')


const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const fileRoutes = require('./routes/file-upload-routes');

const PORT = process.env.PORT || 3001
const app = express()
app.use(cors());


app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api', fileRoutes.routes)

app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`)
  })
});
