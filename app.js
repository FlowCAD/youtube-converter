const express = require('express');
const readline = require('readline');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', (req, res) => res.render('index'));

app.post('/download', async (req, res) => {
  const videoURL = req.body.videoURL;

  const info = await ytdl.getInfo(videoURL)
  if (!info.videoDetails) return;
  const song = {
    title: info.videoDetails.media.song || info.videoDetails.title || 'music',
    artist: info.videoDetails.media.artist || null,
    album: info.videoDetails.media.album || null
  };

  const stream = ytdl(videoURL, { quality: 'highestaudio' });
  //set response headers
  res.setHeader('Content-disposition', `attachment; filename=${song.title}.mp3`);
  res.setHeader('Content-type', 'audio/mpeg');

  //set stream for conversion
  var proc = new ffmpeg({source: stream});

  let start = Date.now();
  proc
    .withAudioCodec('libmp3lame')
    .audioBitrate(320)
    .format('mp3')
    .outputOptions(
      '-metadata', `title=${song.title}`,
      '-metadata', `artist=${song.artist}`,
      '-metadata', `album=${song.album}`,
      '-metadata', `album_artist=${song.artist}`
    )
    .output(res)
    .run();

  proc.on('progress', p => {
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`${p.targetSize}kb téléchargés`);
  })

  proc.on('end', () => {console.log(`\nConversion effectuée en ${(Date.now() - start) / 1000}s`)});
});

app.listen(port, () => console.log(`Server is running on port ${port}`));