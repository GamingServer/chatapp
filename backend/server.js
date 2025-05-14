const express = require('express');
const cors = require('cors');
require('dotenv').config();
const adminAuth = require('./routes/adminAuth.js');
const userData = require('./routes/userData.js');
const message = require('./routes/messages.js');
const connectToMongodb = require('./db/connectToDB.js');
const { app, server } = require('./socket.io/socket.js')
const PORT = process.env.PORT || 5000;
// const pidusage = require('pidusage');
const imageUpload = require('./routes/image.js')
const path = require('path');
const cookieParser = require('cookie-parser')
const categoryRouter = require('./routes/categoryRoute.js');




// setInterval(() => {
//   pidusage(process.pid, (err, stats) => {
//     if (err) return console.error('Error:', err);
//     console.clear();
//     console.log(`RAM: ${(stats.memory / 1024 / 1024).toFixed(2)} MB`);
//     console.log(`CPU: ${stats.cpu.toFixed(2)}%`);
//   });
// }, 2000); // update every 2 seconds

app.use(cors(
  {
    origin: true ,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
));
app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/admin', adminAuth)

app.use('/api/user', userData);

app.use('/api/messages', message)

app.use('/api/image', imageUpload);

app.use('/api/category',categoryRouter);

app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use(express.static(path.join(__dirname,'../frontend/build')))

app.get('/', (req, res) =>{ 
  res.sendFile(path.join(__dirname,'../frontend/build/index.html'))
})

server.listen(PORT, async () => {
  await connectToMongodb();
  console.log(`Server is running on port ${PORT}`);
});