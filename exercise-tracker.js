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


app.get("/api/users/:_id/logs", async (req, res)=>{
    const  userId = req.params._id;
    const { from, to, limit } = req.query;

    try {
       const user = await User.findById(userId);

       if(!user){
        return res.json({error: "No user with id: " + userId });
       }

       let query = { username: user.username };

       // Add date range filter if 'from' and 'to' are provided
       if (from && to) {
           query.date = { $gte: new Date(from), $lte: new Date(to) };
       }

       // Apply limit if provided
       let options = {};
       if (limit) {
           options.limit = parseInt(limit);
       }

       const user_exercise = await Exercise.find(query, {}, options);

       const logs = user_exercise.map(ex => ({
         description: ex.description,
          duration: ex.duration,
           date: ex.date}))

     let result = {
        _id: userId,
        username: user?.username, 
        count: user_exercise.length,
        log: [...logs]
       }    

       if(from && to){
           result.from = new Date(from).toDateString();
          result.to = new Date(to).toDateString();
       }

       res.json(result)

    } catch (error) {
        console.log(error);
    }
})
                         

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
