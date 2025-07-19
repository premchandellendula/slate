import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'
const PORT = process.env.PORT || 3001
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors())
import rootRouter from './routes/index'

app.get('/', (req, res) => {
    res.send("API is working🚀")
})

app.use('/api/v1', rootRouter)

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`)
})