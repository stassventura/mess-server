const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const axios = require('axios')
const qs = require('qs');
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
app_key = 'eqako3e9asago9omifu9';//Add Your App Key
api_key = '9429800ccaa1cb4c0ec4b92ca45d00ae1d0daddd'; //Add Your API Key
secret_key = 'yqezyfy3akizela6ere3'; //Add Your Secret Key
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
  // Конфигурация запроса
  const options = {
    method: 'POST',
    url: `https://api.ringcaptcha.com/${app_key}/code/sms`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: qs.stringify({
      phone: fullPhone,
      api_key: api_key,
    })
  };
  try {
    // Отправить запрос
    const response = await axios(options);
    // Проверить статус ответа
    if (response.data.status === 'SUCCESS') {
      console.log('SMS sent successfully');
      res.send('SMS sent successfully');
    } else {
      console.error('Error from RingCaptcha:', response.data.message);
      res.status(500).send('Error from RingCaptcha');
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).send('Error sending SMS');
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