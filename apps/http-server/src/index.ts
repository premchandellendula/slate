import express from 'express';
const PORT = process.env.PORT || 3001
const app = express();
import rootRouter from './routes/index'

app.get('/', (req, res) => {
    res.send("API is working🚀")
})

app.use('/api/v1', rootRouter)

app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`)
})