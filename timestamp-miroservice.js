// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const isValidDate = function(date) {
  return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

app.get("/api/:date?", (req, res, next) =>{
  const date = req.params.date;
  // console.log(date);

  if(date === undefined){
    return res.json({unix: new Date().valueOf(),utc: new Date().toUTCString() });
  }

  if(isValidDate(date)){
      return res.json({unix: new Date(date).valueOf(),utc: new Date(date).toUTCString });
  }

  res.json({error: "Invalid date"});

})

        app.get("/api/1451001600000", (req, res) =>{
  const dateObject = new Date(1451001600000);
  res.json({
    unix: dateObject.getTime(),
    utc: dateObject.toUTCString()
  });
})



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
