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


// create exercise modal
const exerciseSchema = new mongoose.Schema({
  username: {type:String},
  description: {type:String, required: true},
  duration: {type: Number, required: true },
  date: {type : Date}
});

const Exercise = mongoose.model('Exercise', exerciseSchema);

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
       res.json(savedUser);
    } catch (error) {
      console.log(error);
    }
})


async function updateDates() {
  try {
    const exercises = await Exercise.find();

    for (const exercise of exercises) {
      exercise.date = new Date(exercise.date);
      await exercise.save();
    }

    console.log('All dates updated successfully');
  } catch (error) {
    console.error('Error updating dates:', error);
  }
}


app.post("/api/users/:_id/exercises", async function (req, res){ 
    let { description, duration, date} = req.body;  
    // console.log(typeof duration);

    if(!description || !duration){
      return res.json({error: "Invalid input"});
    }

    if(date){
      date = new Date(date);
    }else{
      date = new Date();
    }

    try {
      let user = await User.findById(req.params._id);
      let exercise = new Exercise({username: user.username, description, duration: parseInt(duration), date});
      // console.log(exercise);
      const savedExercise = await exercise.save();
      console.log(savedExercise);
      // 65d2e48d893dc189c1c44827
      res.json(
       { username: user.username, 
        _id: req.params._id, 
        description,
        duration: parseInt(duration),
        date : date.toDateString()
      }
       );
    } catch (error) {
       console.log(error);
    }
})

// {
//   "_id": "612109b0f5860e05a3652f71",
//   "username": "fcc_test_16295551193",
//   "from": "Mon Nov 02 2020",
//   "to": "Mon Feb 12 2024",
//   "count": 1,
//   "log": [
//   {
//   "description": "BACS",
//   "duration": 443950345034,
//   "date": "Mon Aug 21 2023"
//   }
//   ]
//   }

app.get("/api/users/:_id/logs", async (req, res)=>{
    const  userId = req.params._id;
    const { from, to, limit } = req.query;

    try {
       const user = await User.findById(userId);

       if(!user){
        return res.json({error: "No user with id: " + userId });
       }

       let query = { username: user.username };

      // Convert date strings to JavaScript Date objects
      let fromDate = from ? new Date(from) : null;
      let toDate = to ? new Date(to) : null;

      // Add date range filter if 'from' and 'to' are provided
      if (fromDate && toDate) {
          query.date = { $gte: fromDate, $lte: toDate };
      } else if (fromDate) {
          query.date = { $gte: fromDate };
      } else if (toDate) {
          query.date = { $lte: toDate };
      }

      // Apply limit if provided
      let options = {};
      if (limit) {
          options.limit = parseInt(limit);
      }

       const user_exercise = await Exercise.find(query, {}, options);

       const logs = user_exercise.map(ex => ({
         description: ex.description,
          duration: parseInt (ex.duration),
           date: ex.date.toDateString()}))

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
