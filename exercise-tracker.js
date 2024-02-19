const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const bodyParser = require('body-parser')



// Connect to mongodb
mongoose.connect(process.env.MONGO_URI)
.then(data => console.log("CONNECTED TO DB..."))
.catch(err =>{
  console.log(err);
});



app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// create user modal
const userSchema  = new mongoose.Schema({
  username: {type: String, required: true} ,
})

const User = mongoose.model('User', userSchema);

app.get("/api/users", async function (req, res){
    let users  = await User.find();
    res.send(users);
})

app.post("/api/users", async function (req, res){
    const {username} = req.body;
    if(!username){
      return res.json({error: "incorrect data"});
    }

    try {
       let user = new User({username});
       const savedUser = await user.save();
    console.log(savedUser);

       res.json(savedUser);

    } catch (error) {
      console.log(error);
    }
})

app.post("/api/users/:_id/exercises", function (req, res){ 
   
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
