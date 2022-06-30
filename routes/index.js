var express = require('express');
var router = express.Router();
var axios = require('axios');
var cheerio = require('cheerio');
const { contains } = require('cheerio/lib/static');

var newspapers = [
  {
    name: 'thetimes',
    address: 'https://www.thetimes.co.uk/environment/climate-change',
    base: ''
  },
  {
    name: 'guardian',
    address: 'https://www.theguardian.com/environment/climate-crisis',
    base: ''
  },
  {
    name: 'telegraph',
    address: 'https://www.telegraph.co.uk/environment',
    base: 'https://www.telegraph.co.uk'
  },
]

var articles = []

newspapers.forEach(newspaper => {
  axios.get(newspaper.address)
    .then((response) =>{
      const html = response.data
      const $ = cheerio.load(html)

      $('a:contains("climate")', html).each(function() {
        const title = $(this).text()//.replace("\n", "")        
        const url = $(this).attr('href')
        articles.push({
          title,
          url: newspaper.base + url,
          source: newspaper.name
        })
      })
    }).catch((err) => console.log(err));
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Welcome to Climate News Info API' });
});

router.get('/api', function(req, res, next) {
  res.json('Welcome to Climate News Info API');
});

router.get('/api/news', function(req, res, next){
  res.json(articles)
});

router.get('/api/news/:newspaperId', function(req, res, next){
  console.log(req.params.newspaperId)
  const newspaperId = req.params.newspaperId
  const newspaperAddress = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].address
  const newspaperBase = newspapers.filter(newspaper => newspaper.name == newspaperId)[0].base
  
  console.log(newspaperAddress)

  axios.get(newspaperAddress)
  .then((response)=>{
    const html = response.data;
    const $ = cheerio.load(html);
    const specificArticles = [];

    $('a:contains("climate")', html).each(function() {
      const title = $(this).text()
      const url = $(this).attr('href')
      specificArticles.push({
        title,
        url: newspaperBase + url,
        source: newspaperId
      })
    })
    res.json(specificArticles)
  }).catch((err) => console.log(err));

});

router.get('/api/newsdemo', function(req, res, next){
  axios.get('https://www.theguardian.com/environment/climate-crisis')
  .then((response)=>{
    const html = response.data;
    //console.log(html);
    const $ = cheerio.load(html);

    $('a:contains("climate")', html).each(function() {
      const title = $(this).text()
      const url = $(this).attr('href')
      articles.push({
        title,
        url
      })
    })
    res.json(articles)
  }).catch((err) => console.log(err));
});

module.exports = router;
