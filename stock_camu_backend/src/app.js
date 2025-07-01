const express = require('express');
const rolesRouter = require('./routes/rolesRouter');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/roles', rolesRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
