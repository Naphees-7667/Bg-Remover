import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoutes.js';

const app = express();
await connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => { 
    res.send('Hello from server');
});

app.use('/api/user',userRouter);

const PORT  = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});