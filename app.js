import express from 'express'
import path from "path";
import {authMiddleware} from "./middlewares/middlewares.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { create, getAll, remove, update, getUpdateModel } from "./controllers/articleController.js";
import { register, getByEmail } from "./controllers/userController.js";
import {secretKey} from "./config.js";

const __dirname = path.resolve()
const PORT = 3000
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

app.get('/getArticlesByName/:name?', async (req, res)=>{
    let articles = []
    await getAll(getData)
    articles = val
    if (req.params.name === 'undefined') {
        return res.status(200).send(articles)
    } else {
        return res.status(200).send(articles.filter(x => x.name.includes(req.params.name)))
    }
})

app.get('/', authMiddleware, async (req, res)=>{
    res.render('index', {authorId: req.cookies.current_user_id})
})

app.get('/dfy', authMiddleware, async (req, res)=>{
    res.render('dfy', {authorId: req.cookies.current_user_id})
})

app.get('/edit/:id', authMiddleware, async (req, res)=>{
    let article = []
    await getUpdateModel(req.params.id, getData)
    article = val
    if (typeof article === 'undefined') return res.status(500).send("Article not found!");
    if (req.cookies.current_user_id != article.author_id) return res.status(500).send("This article is not your!");
    res.render('edit', {article: article})
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

app.post('/delete/:id', authMiddleware, async (req, res) => {
    console.log(req.params.id)
    await remove(req.params.id)
    return res.redirect("/");
})

app.post('/edit', authMiddleware, async (req, res) => {
    if (req.cookies.current_user_id != req.body.author_id) return res.status(500).send("This article is not your!");
    await update(req.body)
    return res.redirect("/");
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
        res.cookie("current_user_id", val[0].id, {httpOnly:true})
        return res.redirect("/");
    }
    catch {
        return res.status(500).send("Server error!");
    }

})

app.post('/exit', async(req, res) => {
    res.clearCookie("token")
    res.clearCookie("current_user_id")
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