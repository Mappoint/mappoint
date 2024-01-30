const mongoose = require('mongoose');
const Marker = require('../models/Marker');
const cors = require('cors')();

exports.handler = cors(async (event, context) => {
  try {
    // Your existing logic for storing markers
    const markers = JSON.parse(event.body).markers;
    await Marker.deleteMany();
    await Marker.insertMany(markers);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
});
