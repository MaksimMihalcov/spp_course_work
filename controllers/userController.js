import sqlite3 from 'sqlite3'

const TABLE_NAME = 'users'
const sqlite = sqlite3.verbose()
const db = new sqlite.Database('./models/crs.db', sqlite3.OPEN_READWRITE,(err)=>{
    if(err) throw err
})


db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, TABLE_NAME, (err, row) => {
    if (row === undefined)
        db.run(`CREATE TABLE ${TABLE_NAME}(id INTEGER PRIMARY KEY, email, hash)`);
})

export async function getByEmail(email, callback) {
    db.all(`SELECT * FROM ${TABLE_NAME} WHERE email=?`, [email], (err, rows)=>{
        if(err) {
            console.log(err)
            callback([])
        }
        callback(rows)
    })
    await new Promise(r => setTimeout(r, 1000));
}

export async function register(email, hash) {
    await db.run(`INSERT INTO ${TABLE_NAME}(email, hash) VALUES (?, ?)`, [email, hash], (err)=>{
        if(err) throw err
    })
}