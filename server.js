

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static('public'));

mongoose.connect('mongodb+srv://mapclient75:Map%40123!@cluster.j353ypw.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });


const Marker = mongoose.model('Marker', {
  lat: Number,
  lng: Number,
  name: String,
  contacts: [{ name: String, phone: String, details: String }],
});

app.use(cors());
app.use(bodyParser.json());

app.post('/api/storeMarkers', async (req, res) => {
  try {
    const markers = req.body.markers;
    await Marker.deleteMany();
    await Marker.insertMany(markers);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/retrieveMarkers', async (req, res) => {
  try {
    const markers = await Marker.find();
    res.json({ markers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve map.html
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
