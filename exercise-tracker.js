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

app.post("/api/users/:_id/exercises", async function (req, res){ 
    let {_id, description, duration, date} = req.body;  
    // console.log(req.params._id);

    if(!description || !duration){
      return res.json({error: "Invalid input"});
    }

    if(date){
      date = new Date(date).toDateString();
    }else{
      date = new Date().toDateString();
    }

    try {
      let user = await User.findById(req.params._id);
      let exercise = new Exercise({username: user.username, description, duration, date});
      // console.log(exercise);
      const savedExercise = await exercise.save();
      // 65d2e48d893dc189c1c44827
      res.json(
       { username: user.username, 
        _id: user._id, 
        description,
        duration,
        date }
       );
    } catch (error) {
       console.log(error);
    }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
