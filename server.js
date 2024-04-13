
require('dotenv').config();
const express = require('express');
const session = require('express-session');

const api_routes = require('./routes');

const app = express();

app.use(session({
  secret: process.env.SECRET,
  cookie: {
    maxAge: 300000,
    sameSite: 'strict',
  },
  resave: true,
  saveUninitialized: true,
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(api_routes);

app.use(express.static('public'));
app.use(express.static('client/dist'));



app.listen(process.env.PORT);
console.log("server running on " + process.env.PORT)
