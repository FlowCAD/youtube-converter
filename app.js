const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', (req, res) => res.render('index'));

app.post('/convert-mp3', async (req, res) => {
  const videoID = req.body.videoID;
  if ([undefined, '', null].includes(videoID)) {
    return res.render('index', {success: false, message: 'Please enter a video ID.'});
  } else {
    const url = `https://youtube-mp36.p.rapidapi.com/dl?id=${videoID}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Host': process.env.YOUTUBE_API_HOST,
        'X-RapidAPI-Key': process.env.YOUTUBE_API_KEY
      }
    };
    const fetchAPI = await fetch(url, options);
    const fetchResponse = await fetchAPI.json();

    if (fetchResponse.status === 'ok') {
      return res.render('index', {
        success: true,
        song_title: fetchResponse.title,
        song_link: fetchResponse.link
      });
    } else {
      return res.render('index', {
        success: false,
        message: fetchResponse.msg
      });
    }
  }
});


app.listen(port, () => console.log(`Server is running on port ${port}`));