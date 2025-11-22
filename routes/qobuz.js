
import dotenv from 'dotenv';
import Qobuz from '../lucida/build/streamers/qobuz/main.js';
import express from 'express';

const route = express.Router();

dotenv.config();

const client = new Qobuz({
  token: process.env.QOBUZ_USER_TOKEN,
  appSecret: process.env.QOBUZ_APP_SECRET,
  appId: process.env.QOBUZ_APP_ID,
})


route.get('/test', (req, res) => {
  res.send('Qobuz route is working!');
});

route.get('/search', async (req, res) => {
  const { query } = req.query;
  const result = await client.search(query);
  
  res.send(result);
}); 


route.get('/stream', async (req, res) => {
  const { url } = req.query;
  const result = await client.getByUrl(url);
  
  if (result.type == 'track'){
    const stream = await result.getStream();
    res.send(stream);
  }
  else {
    console.error('URL unrecognised');
    res.status(400).send('URL unrecognised');
  }
  
  // res.setHeader('Content-Type', stream.mimeType);
  // res.setHeader('Content-Length', stream.sizeBytes);
  // res.setHeader("Accept-Ranges", "bytes");
  // stream.stream.pipe(res);
});

export default route;