const messageModel = require("../models/messageModel");

const crypto = require("crypto-js");

const key = "chave_secreta";


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
                message: crypto.RC4.decrypt(msg.message.text, key).toString(crypto.enc.Utf8)
            };
        });

        res.json(projectMessages);
    } catch (error) {
        next(error);
    }
};

