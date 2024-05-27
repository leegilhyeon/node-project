import express from 'express';
import UsersRouter from './routers/users.router.js';
import 'dotenv/config';
// import errorHandler from './middlewares/error-handler.middleware.js';
import cookieParser from 'cookie-parser';


const app = express();
const port = process.env.SERVER_PORT;

app.use(express.json());
// app.use(errorHandler());
app.use(cookieParser());
app.use('/api', [UsersRouter]);

app.get('/', (req, res) => {
    return res.json('hello');
});

app.listen(port, () => {
    console.log(`Server is listening on ${port}`);
});