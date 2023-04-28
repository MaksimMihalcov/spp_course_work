import express from 'express'
import path from "path";
import {authMiddleware} from "./middlewares/middlewares.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { create, getAll } from "./controllers/articleController.js";
import { register, getByEmail } from "./controllers/userController.js";
import {secretKey} from "./config.js";

const __dirname = path.resolve()
const PORT = 3001
const app = express()
let val = []

app.use(express.json({limit: '1mb'}))
app.use(express.urlencoded({extended: false}))
app.set('view engine', 'ejs')
app.set('views',path.resolve(__dirname, 'templates'))
app.use(express.static('res'));
app.use(cookieParser())

function getData(data) {
    val = data
}

app.get('/', authMiddleware, async (req, res)=>{
    let articles = []
    await getAll(getData)
    articles = val
    res.render('index', {articles: articles})
})

app.get('/dfy', authMiddleware, async (req, res)=>{
    res.render('dfy')
})

app.get('/login', async (req, res)=>{
    res.render('login')
})

app.get('/register', async (req, res)=>{
    res.render('register')
})

app.post('/add', authMiddleware, async (req, res) => {
    await create(req.body);
    res.redirect('/');
})

app.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body
        await getByEmail(email, getData)
        if (val === []) return res.status(500).send("Incorrect email!");
        const isValidPassword = await bcrypt.compare(password, val[0].hash)
        if (!(isValidPassword)) return res.status(500).send("Incorrect password!");
        const token = jwt.sign({email, password}, secretKey, {expiresIn: "1h"})
        res.cookie("token", token, {httpOnly:true})
        return res.redirect("/");
    }
    catch {
        return res.status(500).send("Server error!");
    }

})

app.post('/exit', async(req, res) => {
    res.clearCookie("token")
    return res.redirect("/login")
})

app.post('/register', async(req, res) => {
    try {
        const {email, password} = req.body
        await getByEmail(email, getData)
        if (val === []) return res.status(500).send("Email already register");
        const hash = await bcrypt.hash(password, 10);
        await register(email, hash);
        return res.redirect("/");
    }
    catch {
        return res.status(500).send("Server error!");
    }
})

app.listen(PORT, ()=>{
    console.log("workin")
})