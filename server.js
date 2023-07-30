const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
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

app.post('/sendSms', (req, res) => {
  const {phoneNumber} = req.body
  console.log(phoneNumber)
  res.send(true)

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
    // const ip = '109.89.208.58';
    // console.log(ip)
    // const ip = '185.237.74.247';
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