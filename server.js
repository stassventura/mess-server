const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const axios = require('axios')
const request = require('request');
var ringcaptcha = require('ringcaptcha-nodejs');
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
ringcaptcha.app_key = 'eqako3e9asago9omifu9';//Add Your App Key
ringcaptcha.api_key = '9429800ccaa1cb4c0ec4b92ca45d00ae1d0daddd'; //Add Your API Key
ringcaptcha.secret_key = 'yqezyfy3akizela6ere3'; //Add Your Secret Key
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
  const {phone, phoneCode} = req.body;
  data = {mobile: phone, country_code: phoneCode,service:'SMS'}
  ringcaptcha.sendingPINCode(data, function (response) {
  console.log(response);
  });
 
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