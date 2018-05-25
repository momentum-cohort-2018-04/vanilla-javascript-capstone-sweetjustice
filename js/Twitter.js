import request from 'superagent'
import $ from 'jquery'

$(document).ready(function () {
  $('#twitter-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    // console.log(result)

    const queryKey = result[0].value
    // console.log(queryKey)
    const queryUrl = encodeURI(queryKey)
    // const queryUrl2 = encodeURIComponent(queryKey)
    // console.log(queryUrl)
    // console.log(queryUrl2)
    this.reset()
    twitterSearch(queryUrl)
  })
})

function twitterSearch (term) {
  request.get(`http://localhost:8000/1.1/search/tweets.json?q=${term}`)
    .then(res => {
      return JSON.parse(res.text)
    })
    .then(tweets => {
      console.log(tweets)
    })
}
