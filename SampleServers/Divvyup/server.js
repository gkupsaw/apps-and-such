require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const MongoQueries = require('./MongoQueries.js');
const MongoSchemas = require('./MongoSchemas.js');
const User = MongoSchemas.User;
const Party = MongoSchemas.Party;
const port = 8080;

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
const url = process.env.DB_HOST;

//mongoose.Promise = Promise; // use an updated promise library
mongoose.connect(url, {useNewUrlParser: true});

db.on('error', console.error); // log any errors that occur

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
let parties = new Map();

io.sockets.on('connection', function(socket){
    socket.on('join', async function(party, user, callback){
        console.log('Socket Connected! Party:', party.name, 'User:', user.username);
        
        socket.join(party.id);
        socket.user = user;
        socket.party = party;   //never refer to socket.party.users as it will change a lot. refer to map instead
        socket.contribution = 0;
        
        if ([...parties.keys()].indexOf(party.id) == -1)   {    //make a new party item in the map if needed
            console.log('Making new party');
            parties.set(party.id, []);
        }
        
        let currIDs = [];
        parties.get(party.id).forEach(el => {
            currIDs.push(el.user.id);
        });
        
        if (currIDs.indexOf(user.id) == -1)  {  //add a new guest
            console.log('Adding new active party');
            parties.get(party.id).push({
                user:  {
                    id: user.id,
                    username: user.username,
                    contribution: 0,
                    payment: 0,
                    active: true,
                    sessionID: socket.id
                }
            });
            user.active_parties.push({
                party:    {
                    name: party.name,
                    id: party.id
                }
            });
            await User.updateOne({ id: user.id }, { $set: {active_parties: user.active_parties} });
        }
        
        parties.get(party.id).forEach(el => {
            if (el.user.id == user.id)   {   //have to update user sessionID and payment
                el.user.sessionID = socket.id;
                el.user.active = true;
                // this_user = el.user;
            }
            el.user.payment = detPrice(party.cost, parties.get(party.id).length, el.user.contribution);
        });     
        
        Party.updateOne({ id: party.id }, {users: parties.get(party.id)}, function(err)    {
            if (err) console.error(err);
            console.log("Updated users!");
            callback(party.users);
            io.sockets.in(party.id).emit('membershipChanged', parties.get(party.id));
        });
    });
    
    socket.on('getConfirmation', function(requester, contribution) {
        parties.get(socket.party.id).forEach(el => {
            if (el.user.id === socket.party.owner_id)   {
                io.to(el.user.sessionID).emit('contributeRequest', requester, contribution);
            }
        });
    });
    
    socket.on('contribute', function(requester, contribution){
        console.log('Contribution Request');
        
        const users = parties.get(socket.party.id);

        for (let i = 0 ; i < users.length ; i++)    {
            if (users[i].user.id == requester.id) {
                users[i] = {
                    user:  {
                        id: users[i].user.id,
                        username: users[i].user.username,
                        contribution: parseFloat(contribution) + parseFloat(users[i].user.contribution),  //updated
                        payment: detPrice(socket.party.cost, users.length, users[i].user.contribution),    //updated
                        active: users[i].user.active,
                        sessionID: users[i].user.sessionID
                    }
                };
                socket.contribution = users[i].user.contribution;
                console.log('Updated Contribution');
            }
        }

        Party.updateOne( {id: socket.party.id}, {users: parties.get(socket.party.id)}, function(err) {
            if (err) return console.error(err);
            io.sockets.in(socket.party.id).emit('membershipChanged', parties.get(socket.party.id));
            console.log("Updated costs!");
        });
    });
    
    socket.on('endParty', function(){
        Party.updateOne({ id: socket.party.id }, { archived: true }).then(() => {
            console.log('Ending party...');
            io.sockets.in(socket.party.id).emit('partyEnded', parties.get(socket.party.id));
        });
        
    });
    
    socket.on('cancelParty', function(){
        Party.updateOne({ id: socket.party.id }, { archived: true }).then(() => {
            console.log('Cancelling party...');
            closeParty(0);
        });
    });

    socket.on('updateMyBalance', function(payment)    {
        closeParty(payment);
    });
    
    socket.on('error', function(){});
    
    function detPrice(cost, users_amt, contribution)  {
        if (users_amt == 0) {
            console.log('error, no users in party. user is not accounted for.')
            return 0;
        }
        return Math.round(parseFloat(parseFloat(cost) / parseFloat(users_amt) - parseFloat(contribution)) * 100) / 100;
    }

    function closeParty(payment)   {
        socket.user.previous_parties.push({
            party:    {
                name: socket.party.name,
                cost: payment,
                id: socket.party.id
            }
        });
        
        for (let i = 0; i < socket.user.active_parties.length; i++)  {
            if (socket.user.active_parties[i].party.id == socket.party.id) {
                socket.user.active_parties.splice(i, 1);
            }
        }

        User.updateOne( {id: socket.user.id}, { 
            $set: { "previous_parties": socket.user.previous_parties, "active_parties": socket.user.active_parties }, 
            $inc: { accountBalance: -1 * parseFloat(payment) }
        }).then(() => {
            io.sockets.in(socket.party.id).emit('disconnect');
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

const bodyParser = require('body-parser');
const colors = require('colors');
const path = require('path');
const cors = require('cors');
app.use(cors({origin: true}));
app.use(express.static(__dirname,+'/party'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/register', function(req, res){
    console.log('- Registration request received:', req.method.cyan, req.url.underline);
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ username: username }, async function(err,data) {
        if (err) return console.error(err);
        if (data != null)   {
            res.send({exists: true});
        }
        else    {
            MongoSchemas.CreateUser(username, password, res);
        }
    });
});

app.post('/login', async function (req, res) { 
    console.log('- Login request received:', req.method.cyan, req.url.underline);
    const response = await MongoQueries.AuthenticateUser(req.body.username, req.body.password);
    res.send(response);
});

app.delete('/', function(req, res){
    console.log('- Login request received:', req.method.cyan, req.url.underline);
    MongoSchemas.DeleteData();
    parties = new Map();
    console.log('Removed All Data!');
    res.end();
});

app.post('/host', async function(req, res)  {
    console.log('- Host request received:', req.method.cyan, req.url.underline);
    const new_party = await MongoSchemas.CreateParty(req.body.name, req.body.cost, req.body.owner_id);
    console.log(new_party);
    res.send({ party: new_party });
});

app.get('/join', async function(req, res)   {
    console.log('- Join request received:', req.method.cyan, req.url.underline);
    const parties = await MongoQueries.GetParty();
    res.send(parties);
});

app.post('/info', async function(req, res)    {
    console.log('- Info request received:', req.method.cyan, req.url.underline);
    const user = await MongoQueries.GetUser(req.body.id);
    const party = await MongoQueries.GetParty(req.body.party_id);
    res.send({ user: user, party: party });
});

app.get('*', function(request, response)    {   //error
    console.log('- request received:', request.method.cyan, request.url.underline);
    console.log('error')
    response.send('<h1>Error 404: Page Does Not Exist</h1>');
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

server.listen(port, function()   {
    console.log('Server listening on', port)
});