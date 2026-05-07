module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send('Помилка: ' + err.message);
};
