const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoSchemas = require('./MongoSchemas.js');
const Compliment = MongoSchemas.Compliment;
const Image = MongoSchemas.Image;
const port = 8080;

if (dotenv.error) console.log('DOTENV error:', dotenv.error);

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const db = mongoose.connection;

db.once('open', function() {    // bind a function to perform when the database has been opened
  console.log("Connected to DB!");
});
process.on('SIGINT', function() {   //CTR-C to close
   mongoose.connection.close(function () {
       console.log('DB connection closed by Node process ending');
       process.exit(0);
   });
});
const url = process.env.MONGO_HOST;

//mongoose.Promise = Promise; // use an updated promise library
mongoose.connect(url, {useNewUrlParser: true});

db.on('error', console.error); // log any errors that occur

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const socket_name = 'Universal';

io.sockets.on('connection', function(socket){
    socket.on('join', () => {
        console.log('Socket Connected! Socket ID:', socket.id);
        socket.join(socket_name);
    });

    socket.on('complimentFavorited', compliment => {
        Compliment.updateOne({ id: compliment.id }, { $set: { favorited: !compliment.favorited } }, err => {
            if (err) console.log(err);
            console.log('Compliment favorited');
            Compliment.find({}, (err,data) => {
                if (err) return console.error(err);
                io.sockets.in(socket_name).emit('complimentsUpdated', data);
            });
        });
    });
    
    socket.on('error', function(){});
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//File Uploading
//https://medium.com/@fabianopb/upload-files-with-node-and-react-to-aws-s3-in-3-steps-fdaa8581f2bd
//https://expressjs.com/en/starter/static-files.html
//https://codeburst.io/image-uploading-using-react-and-node-to-get-the-images-up-c46ec11a7129
//https://medium.com/@mahesh_joshi/reactjs-nodejs-upload-image-how-to-upload-image-using-reactjs-and-nodejs-multer-918dc66d304c
//https://medium.com/@paulrohan/file-upload-to-aws-s3-bucket-in-a-node-react-mongo-app-and-using-multer-72884322aada

//Image Serving
//https://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs

//Cheat Sheets
//https://kapeli.com/dash

//NPM
//https://www.npmjs.com/package/multer-s3

//S3
//https://www.zeolearn.com/magazine/uploading-files-to-aws-s3-using-nodejs
//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html


/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const colors = require('colors');
const cors = require('cors');
const multer = require('multer');
const multers3 = require('multer-s3');
const AWS = require('aws-sdk');
app.use(cors({origin: true}));
app.use('/uploads', express.static('./compliment/src/uploads'));

app.use(bodyParser.urlencoded({limit: '50mb', extended: false}));
app.use(bodyParser.json({limit: '50mb', extended: true}));

app.use(function(req, res, next) {  //copied from enable-cors.org, handles CORS related errors
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
}); 

/* Multer (local storage, seems completely functional) */

// const storage = multer.diskStorage({
//     destination: (req, file, callback) => callback(null, './compliment/src/uploads'),
//     filename: (req, file, callback) => callback(null, 'IMG-' + MongoSchemas.formatDate() + '-' + file.originalname)
// });

// upload = multer({storage}).single('image');

// app.post('/upload', (req, res) => {
//     console.log('- Image upload request received:', req.method.cyan, req.url.underline);
//     upload(req, res, err => {
//         if (err) console.log('Error uploading'.red, err);
//         MongoSchemas.UploadImage(req.file, db_file => {
//             console.log(db_file);
//             res.status(200).send(db_file);
//         });
//     });
// });

/* Multer S3 */

const s3 = new AWS.S3();
const upload = multer({
    storage: multers3({
        s3: s3,
        bucket: process.env.BUCKET,
        key: (req, file, cb) => cb(null, Date())
    })
});

app.post('/upload', upload.single('image'), (req, res) => {
    console.log('- Image upload request received:', req.method.cyan, req.url.underline);
    if (err) return console.log('Error uploading to bucket:'.red, err);
    MongoSchemas.UploadImage(req.file, db_file => {
        console.log(db_file);
        res.status(200).send(db_file);
    });
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

app.post('/compliment', function(req){
    console.log('- Compliment submission request received:', req.method.cyan, req.url.underline);
    const { compliment, name } = req.body;
    MongoSchemas.CreateCompliment(name, compliment, 
        compliments => {
            io.sockets.in(socket_name).emit('complimentsUpdated', compliments);
            res.status(200).end();
        });
});

app.get('/compliments', function(req, res)   {
    console.log('- Compliment data request received:', req.method.cyan, req.url.underline);
    Compliment.find({}, (err,data) => {
        if (err) return console.error('Error getting compliments:'.red, err);
        res.status(200).send(data);
    });
});

app.get('/pictures', function(req, res)   {
    console.log('- Images request received:', req.method.cyan, req.url.underline);
    Image.find({}, (err,data) => {
        if (err) return console.error('Error getting pictures'.red, err);
        console.log(data)
        res.status(200).send(data);
    });
});

app.delete('/delete/compliments', () =>  MongoSchemas.DeleteCompliments());

app.delete('/delete/imgs', () =>  MongoSchemas.DeleteImages());

app.get('*', function(req, res)    {   //error
    console.log('- Bad request received:', req.method.cyan, req.url.underline);
    console.log('Error, invalid routing');
    console.log(req.body.data)
    res.status(404).send('<h1>Error 404: Page Does Not Exist</h1>');
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

server.listen(port, function()   {
    console.log('Server listening on', port.toString().yellow)
});