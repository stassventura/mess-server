const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
var TeleSignSDK = require('telesignsdk');
const cors = require('cors');
const axios = require('axios')
const app = express();
app.use(cors({
  origin: '*'
}));

app.use(express.json())
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Разрешить все домены
    methods: ["GET", "POST"]
  }
});

const customerId = "0FC18263-2B75-4265-B820-635171ACF840";
const apiKey = "RjGVcRxUqRExpB5jcQ4C0Usp2XELdXMP13nq5pnNUS3S+xi5Sq0eWniN3rMx5S5LjMOHSeXZJbgmx1cw1zDkbQ==";
const rest_endpoint = "https://rest-api.telesign.com";
const timeout = 10*1000; // 10 secs

const client = new TeleSignSDK( customerId,
apiKey,
rest_endpoint,
timeout // optional
// userAgent
);

const phoneNumber = "32473368733";
const message = "You're scheduled for a dentist appointment at 2:30PM.";
const messageType = "ARN";



const PORT = process.env.PORT || 3000;

const rooms = new Map();

app.get('/rooms', (req, res) => {
    res.json(rooms);
});
app.post('/rooms', (req, res) => {
    const {roomName, userName} = req.body
    if(!rooms.has(roomName)){
        rooms.set(
            roomName, 
            new Map([
                ['users', new Map()],
                ['messages', []],
            ])
        )
    }
    res.json([...rooms.keys()])
});

app.post('/sendSms', async (req, res) => {
  const {phone, phoneCode} = req.body;
  // Полный номер телефона
  const fullPhone = phoneCode + phone;
  function messageCallback(error, responseBody) {
    if (error === null) {
    console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
        ` => code: ${responseBody["status"]["code"]}` +
        `, description: ${responseBody["status"]["description"]}`);
    } else {
    console.error("Unable to send message. " + error);
    }
    }
  client.sms.message(messageCallback, phoneNumber, message, messageType);
 
});


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    // socket.on('message', (msg) => {
    //     console.log('Message from client:', msg, 'Client ID:', socket.id);
    //   });
    // console.log('___________________________________________')
    socket.on('ROOM:JOIN', (data) => {
        console.log(data)
    })
});

app.get('/location', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress; 
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json/`);
      const country = response.data.country;
      const language = req.headers['accept-language'].split(',')[0].slice(0, 2);
      console.log(country, language)
      res.json({ country, language });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Unable to determine location' });
    }
  });


server.listen(PORT, (err) =>{
    if(err){
        throw Error(err);
    }
    console.log(`Сервер запущен на порту: ${PORT}`)
});