const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose =  require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');

const app = express();

mongoose.connect(`mongodb+srv://mugiwara:${process.env.MONGO_ATLAS_PW}@cluster0-dwtab.mongodb.net/node-angular?retryWrites=true`, {
  useNewUrlParser: true
})
  .then( () => {
    console.log('Connected to databse');
  })
  .catch( () => {
    console.log('Connection failed')
  });
app.use(bodyParser.json());
app.use("/images", express.static(path.join('backend/images')));

app.use( (req, res, next) =>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With-Header, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);


module.exports = app;
