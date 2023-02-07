const messageModel = require("../models/messageModel");
function encryptRC4(text, key) {
        let s = [];
        for (let i = 0; i < 256; i++) {
            s[i] = i;
        }
    
        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
            [s[i], s[j]] = [s[j], s[i]];
        }
    
        let i = 0;
        j = 0;
        let encrypted = "";
        for (let k = 0; k < text.length; k++) {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            [s[i], s[j]] = [s[j], s[i]];
            encrypted += String.fromCharCode(text.charCodeAt(k) ^ s[(s[i] + s[j]) % 256]);
        }
    
    return encrypted;
}
    

function decryptRC4(encryptedText, password) {
    return encryptRC4(encryptedText, password);
}


function diffieHellman(p, g) {
    const privateKeyA = Math.floor(Math.random() * (p - 2)) + 2;
    const privateKeyB = Math.floor(Math.random() * (p - 2)) + 2;
  
    const publicKeyA = (g ** privateKeyA) % p;
    const publicKeyB = (g ** privateKeyB) % p;
  
    const sharedSecretA = (publicKeyB ** privateKeyA) % p;
    const sharedSecretB = (publicKeyA ** privateKeyB) % p;
  
    return [sharedSecretA, sharedSecretB];
}

  function getNextPrime(start, end) {
    for (let i = start + 1; i <= end; i++) {
      if (isPrime(i)) {
        return i;
      }
    }
    
    return -1;
  }
  
  function isPrime(num) {
    if (num < 2) return false;
    
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        return false;
      }
    }
    
    return true;
  }
function getInteger() {
    return Math.floor(Math.random() * 100);
}


const number = getInteger();
const prime = getNextPrime(1,100)

const [sharedSecretA,sharedSecretB] = diffieHellman(prime,number) 
  

module.exports.addMessage = async (req, res, next) => { 
    try {
        const {from,to,message} = req.body;
        const data = await messageModel.create({
            message:{
                text: encryptRC4(message,sharedSecretA.toString())
            },
            users: [
                from,
                to
            ],
            PublicKey: sharedSecretB,
            sender:from,
        });
        console.log(sharedSecretA)

        if(data) return res.json({
            msg: "Message added successfully"
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
        users: {
            $all: [from, to],
        },
    }).sort({ updatedAt: 1 });

    const projectMessages = messages.map((msg) => {

        return {
            fromSelf: msg.sender.toString() === from,
            message: decryptRC4(msg.message.text,sharedSecretB)
        };
    });
    res.json(projectMessages);
} catch (error) {
    next(error);
    }
}

