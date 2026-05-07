require('dotenv').config();

const express = require('express');
const path    = require('path');

const routes        = require('./routes');
const errorHandler  = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
