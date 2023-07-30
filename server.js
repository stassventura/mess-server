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

app.post('/sendSms', async (req, res) => {
  const { phone, phoneCode } = req.body;
  // Полный номер телефона
  const fullPhone = phoneCode + phone;
  console.log(fullPhone)
  const payload = {
    scheduleTime: "2008-07-12T14:30:01Z",
    messages: [
      {
        phone: fullPhone,
        clientId: "1",
        text: "Код: 13434хуй",
        sender: "Bank",
      }
    ],
    login: "t79012811627",
    password: "613389",
    clientId: '49320593',
  };

  try {
    const response = await axios.post('http://api.prostor-sms.ru/messages/v2/send.json', payload);
    console.log(response)
    res.json({ status: 'success', data: response.data });
  } catch (error) {
    res.json({ status: 'error', message: error.message });
  }
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