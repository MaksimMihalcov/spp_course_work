import sqlite3 from 'sqlite3'

const TABLE_NAME = 'articles'
const sqlite = sqlite3.verbose()
const db = new sqlite.Database('./models/crs.db', sqlite3.OPEN_READWRITE,(err)=>{
    if(err) throw err
})


db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, TABLE_NAME, (err, row) => {
    if (row === undefined)
        db.run(`CREATE TABLE ${TABLE_NAME}(id INTEGER PRIMARY KEY, name, recipe, author_name)`);
})

export async function getAll(callback) {
    await db.all(`SELECT * FROM ${TABLE_NAME}`, (err, rows)=>{
        if(err) {
            console.log(err)
            callback([])
        }
        callback(rows)
    })
    await new Promise(r => setTimeout(r, 1000));
}

export async function create(obj) {
    await db.run(`INSERT INTO ${TABLE_NAME}(name, recipe, author_name) VALUES (?, ?, ?)`, [obj.dname, obj.recipe, obj.uname], (err)=>{
        if(err) throw err
    })
}