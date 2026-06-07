import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./config/connectDB.js"
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import interviewRouter from "./routes/interview.routes.js"
import paymentRouter from "./routes/payment.routes.js"
const app = express()
const port = process.env.PORT || 9000

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())



app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
    connectDB()
})
