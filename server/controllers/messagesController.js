const messageModel = require("../models/messageModel");
const crypto = require('crypto-js');

function generateRandomKey() {
    let key = ''
    let possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    for (let i = 0; i < 16; i++) {
      key += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    // adicionar uma verificação de segurança para garantir que a string tenha pelo menos 1 caractere
    if (key.length === 0) {
        key = 'a';
    }
    return key
}

function rc4Key(key) {
    // codificar a string como UTF-8 antes de usá-la como chave RC4
    let keyBuf = Buffer.from(key, 'utf8')
    let s = []
    for (let i = 0; i < 256; i++) {
      s[i] = i
    }
    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + keyBuf[i % keyBuf.length]) % 256
      let temp = s[i]
      s[i] = s[j]
      s[j] = temp
    }
    return s.toString()
}

const keyRandom = generateRandomKey()
let keyRC4 = rc4Key(keyRandom)
const key = JSON.stringify({keyRC4})

module.exports.addMessage = async (req, res, next) => { 

    try {
        const {from,to,message} = req.body;
        const data = await messageModel.create({
            message:{
                text: crypto.RC4.encrypt(message, key).toString()
            },
            users: [
                from,
                to
            ],
            sender:from,
        });
        console.log(keyRandom)

        if(data) return res.json({
            msg: "Message added successfully!"
        });

        return res.json({ 
            msg: "Failed to add message to DB"
        });
       
    } catch (err) {

        next(err);
    }
};
module.exports.getAllMessage = async (req, res, next) => {
    try {
        const {from,to} = req.body;
        const messages = await messageModel.find({
            users:{
                $all: [from,to],
            },
        }).sort({ updatedAt: 1 });

        const projectMessages = messages.map((msg)=>{
            return{
                fromSelf: msg.sender.toString() === from,
                message: crypto.RC4.decrypt( msg.message.text,key).toString(crypto.enc.Utf8)
            };
        });
        console.log(keyRandom)
        res.json(projectMessages);
    } catch (error) {
        next(error);
    }
};
