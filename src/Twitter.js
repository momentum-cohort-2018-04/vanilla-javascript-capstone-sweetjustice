import request from 'superagent'
import $ from 'jquery'

// request.get('http://localhost:8000/1.1/search/tweets.json?q=kanye+west&result_type=popular')
//   .then(res => {
//     return JSON.parse(res.text)
//   })
//   .then(tweets => {
//     console.log(tweets)
//   })
/*
$(document).ready(function () {
  $('#search-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    const queryUrl = queryKey.replace(/ /g, '+')
    // console.log(queryUrl)
    this.reset()
    twittersearch(queryUrl)
  })
}) */

class Twitter {
  constructor (topic) {
    this.subject = topic.replace(/ /g, '+')
  }

  twittersearch () {
    request.get(`http://localhost:8000/1.1/search/tweets.json?q=${this.subject}&result_type=popular&count=10`)
      .then(res => {
        return JSON.parse(res.text)
      })
      .then(tweets => {
        console.log(tweets)
        const twitterArray = tweets.statuses
        const twitterHTML = this.buildtweets(twitterArray)
        $('.media').html(twitterHTML)
      })
  }

  buildtweets (array) {
    const tweetHTML = []
    for (var entry of array) {
      const tweet = entry.text
      const userName = entry.user.name
      const userScreenName = entry.user.screen_name
      const userImage = entry.user.profile_image_url
      tweetHTML.push(
        `<div class="container media-container">
              <figure class="media-left">
                <p class="image is-96x96">
                  <img src="${userImage}">
                </p>
              </figure>
              <div class="media-content">
                <div class="content media-tweet">
                  <strong>${userName}</strong>
                  <small>@${userScreenName}</small>
                  
                  <br> 
                  <p class="tweet">
                    ${tweet}
                  </p>
                  
                </div>
              </div>
            </div>`
      )
    }
    return tweetHTML
  }
}

/*
function twittersearch (value) {
  request.get('http://localhost:8000/1.1/search/tweets.json?q=kanye+west&result_type=popular&count=10')
    .then(res => {
      return JSON.parse(res.text)
    })
    .then(tweets => {
      console.log(tweets)
      const twitterArray = tweets.statuses
      const twitterHTML = buildtweets(twitterArray)
      $('.media').html(twitterHTML)
    })
}

function buildtweets (array) {
  const tweetHTML = []
  for (var entry of array) {
    const tweet = entry.text
    // const favorites = entry.favorite_count
    // const retweets = entry.retweet_count
    const userName = entry.user.name
    const userScreenName = entry.user.screen_name
    // const userDescription = entry.user.description
    // let shortDescription
    // if (userDescription.length > 80) {
    //   shortDescription = userDescription.substr(0, 80) + '... '
    // } else { shortDescription = userDescription }
    // console.log(shortDescription)
    const userImage = entry.user.profile_image_url
    // const time = entry.created_at
    // const tweetTime = moment.(time).to//ETC ETC ETC MOMENT
    // <small class="media-right">Favorites:${favorites}  Retweets:${retweets}</small>
    // <small> | ${shortDescription}</small>
    tweetHTML.push(
      `<div class="container media-container">
            <figure class="media-left">
              <p class="image is-96x96">
                <img src="${userImage}">
              </p>
            </figure>
            <div class="media-content">
              <div class="content media-tweet">
                <strong>${userName}</strong>
                <small>@${userScreenName}</small>

                <br>
                <p class="tweet">
                  ${tweet}
                </p>

              </div>
            </div>
          </div>`
    )
  }
  return tweetHTML
} */

export default Twitter
