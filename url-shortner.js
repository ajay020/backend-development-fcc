require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const url = require('url');

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:false}));

const urlRegex = /^(http|https):\/\/([\w-]+(?:\.[\w-]+)+)([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/;


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let shorts = [];
let current = 0;

app.post("/api/shorturl", function (req, res){
  const {url: urlString} = req.body;
  if(!urlString){
    return res.json({ error: 'invalid url'});
  }

   // Check if URL matches the regular expression
  if (!urlRegex.test(urlString)) {
    res.json({ error: 'invalid url'});
  } 

  const parsedUrl = url.parse(urlString);
  const hostname = parsedUrl.hostname;

  dns.lookup(hostname, function (err, addresses){
    if(err) {
      console.log(err);
      return res.json({error: 'invalid url'});
    }

    shorts.push({original_url: urlString, short_url: ++current});
    
    res.json({
      original_url : urlString, short_url : current
    })

  })

})

app.get("/api/shorturl/:short", function (req, res){
    const short = req.params.short;

    let shortObj = null;
    shortObj = shorts.find(s => s.short_url === parseInt(short) );

    console.log(shorts, shortObj);


    if(shortObj){
     return res.redirect(shortObj.original_url);
    }
    return res.json({error: 'invalid short'});
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
