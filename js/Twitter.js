import request from 'superagent'

request.get('http://localhost:8000/1.1/search/tweets.json?q=javascript')
  .then(res => {
    return JSON.parse(res.text)
  })
  .then(tweets => {
    console.log(tweets)
  })
