require('colors');
const mongoose = require('mongoose');

const complimentSchema = new mongoose.Schema({
        name: String,
        compliment: String,
        id: String,
        time_stamp: Object,
        favorited: Boolean
    });

const imageSchema = new mongoose.Schema({
        name: String,
        id: String,
        time_stamp: Object,
        data: Object
    });

const Compliment = mongoose.model('Compliment', complimentSchema);
const Image = mongoose.model('Image', imageSchema);

function generateRandIdentifier()   {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < 6; i++)
        result += chars[(Math.floor(Math.random() * chars.length))];

    return result;
}

function formatDate() {
    const date = new Date().getDate(); //Current Date
    const month = new Date().getMonth() + 1; //Current Month
    const year = new Date().getFullYear(); //Current Year
    const hours = new Date().getHours(); //Current Hours
    const min = new Date().getMinutes(); //Current Minutes
    const sec = new Date().getSeconds(); //Current Seconds
    return (year + '-' + month + '-' + date + '-' + hours + '-' + min + '-' + sec);
}

module.exports = {

    complimentSchema,

    Compliment,

    Image,

    generateRandIdentifier,

    formatDate,

    CreateCompliment: function(name, compliment, callback)   {
        const new_compliment = new Compliment ({
            name,
            compliment,
            id: generateRandIdentifier(),
            time_stamp: new Date(),
            favorited: false
        });
        new_compliment.save(function(err, data) {
            if (err) return console.error('Error creating compliment:'.red, err);
            console.log("Created a new compliment!".green);
            callback(data);
        });
    },

    UploadImage: function(file, callback) {
        console.log(typeof new Date())
        const new_img = new Image({
            name: file.originalname,
            id: generateRandIdentifier(),
            time_stamp: new Date(),
            data: file
        });
        new_img.save(function(err, data) {
            if (err) return console.log('Error saving doc to DB:'.red, err);
            console.log("Saved image:".green, file.green);
            callback(data);
        });
    },

    DeleteCompliments: () => {
        Compliment.deleteMany({}).exec();
        console.log('Deleted all compliments!'.yellow);
    },

    DeleteImages: () => {
        Image.deleteMany({}).exec();
        console.log('Deleted all images!'.yellow);
    }
}