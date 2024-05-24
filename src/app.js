import express from 'express';
import 'dotenv/config';
import errorHandler from './middlewares/error-handler.middleware.js';

const app = express();
const port = process.env.SERVER_PORT;

app.use(errorHandler);

app.get('/', (req, res) => {
    return res.json('hello');
});

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});