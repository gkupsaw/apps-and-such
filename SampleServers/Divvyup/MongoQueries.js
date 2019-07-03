const bcrypt = require('bcryptjs');
const MongoSchemas = require('./MongoSchemas.js');
const User = MongoSchemas.User;
const Party = MongoSchemas.Party;
const max_retries = 10;
let num_retries = 0;

async function AuthenticateUser(username, password)    {
    let result = null;
    await User.findOne({ username: username }, function(err,data)   {
        if (err) return console.error(err);
        if (data == null)   {
            result = { success: false };
        }
        else if (bcrypt.compareSync(password, data.password)) {
            result = { user: data, success: true };
        }
    });
    if (result == null && num_retries < max_retries) {
        num_retries += 1;
        return AuthenticateUser(username, password);
    }
    num_retries = 0;
    return result;
}

async function RegisterUser(username, password)    {
    let result = null;
    await User.findOne({ username: username }, async function(err,data) {
        if (err) return console.error(err);
        if (data != null)   {
            result = {exists: true};
        }
        else    {
            const user = await MongoSchemas.CreateUser(username, password);
            result = {user: user, exists: false};
        }
    });
    return result;
}

async function GetParty(party_id)    {
    let party = null;
    if (!party_id)    {
        await Party.find(function(err,data) {
            if (err) return console.error(err);
            party = data;
        });
    }
    else    {
        await Party.findOne({ id: party_id }, function(err,data) {
            if (err) return console.error(err);
            party = data;
        });
    }
    if (party == null && num_retries < max_retries) {
        num_retries += 1;
        return GetParty(party_id);
    }
    num_retries = 0;
    return party;
}

async function GetUser(id)    {
    let user = null;
    await User.findOne({ id: id }, function(err,data) {
        if (err) return console.error(err);
        user = data;
    });
    if (user == null && num_retries < max_retries) {
        num_retries += 1;
        return GetUser(id);
    }
    num_retries = 0;
    return user;
}

module.exports = {
    
    AuthenticateUser: AuthenticateUser,
    
    RegisterUser: RegisterUser,
    
    GetParty: GetParty,
    
    GetUser: GetUser,
    
}