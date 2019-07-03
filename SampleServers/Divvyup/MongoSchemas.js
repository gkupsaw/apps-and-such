const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const partySchema = new mongoose.Schema({
        name: String,
        id: String,
        archived: Boolean,
        cost: Number,
        max_price: Number,
        owner_id: String,
        predicted_guests: Number,
        users:  [{
            user:   {
                id: String,
                username: String,
                contribution: Number,
                payment: Number,
                active: Boolean,
                owner: Boolean,
                sessionID: String
            }
        }]
    });
const userSchema = new mongoose.Schema({
        username: String,
        id: String,
        password: String,
        accountBalance: Number,
        active_parties: [{
            party:  {
                name: String,
                id: String
            }
        }],
        previous_parties: [{
            party:  {
                name: String,
                cost: Number,
                id: String
            }
        }]
    });
const User = mongoose.model('User', userSchema);
const Party = mongoose.model('Party', partySchema);

function generateRandIdentifier()   {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < 6; i++)
        result += chars[(Math.floor(Math.random() * chars.length))];

    return result;
}

module.exports = {

    partySchema: partySchema,

    userSchema: userSchema,

    Party: Party,
    User: User,

    CreateParty: async function(party_name, cost, owner_id)   {
        const new_party = new Party   ({
            name: party_name,
            id: generateRandIdentifier(),
            cost: cost,
            archived: false,
            owner_id: owner_id,
            users: []
        });
        await new_party.save(function(err) {
            if (err) return console.error(err);
            console.log("Created a new party!");
        });
        return new_party;
    },

    CreateUser: function(name, password, res)   {
        let balance = 0;
        const new_user = new User   ({
            username: name,
            id: bcrypt.hashSync(generateRandIdentifier(), 10),
            password: bcrypt.hashSync(password, 10),
            accountBalance: balance
        });
        new_user.save(function(err, data) {
            if (err) return console.error(err);
            console.log("Created a new user!");
            res.send({user: new_user, exists: false});
        });
    },
    
    DeleteData: function()  {
        User.deleteMany({}).exec();
        Party.deleteMany({}).exec();
    },

    GenerateRandIdentifier: generateRandIdentifier,
    
    FormatDate: function()   {
        const date = new Date().getDate(); //Current Date
        const month = new Date().getMonth() + 1; //Current Month
        const year = new Date().getFullYear(); //Current Year
        const hours = new Date().getHours(); //Current Hours
        const min = new Date().getMinutes(); //Current Minutes
        const sec = new Date().getSeconds(); //Current Seconds
        return month + '/' + date + '/' + year + ' ' + hours + ':' + min + ':' + sec;
    }

}