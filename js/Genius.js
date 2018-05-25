import $ from 'jquery'
import request from 'superagent'
// import OAuth from 'oauth'
const token = `ZlLSmhS4-K3TlAOvIFbGig39rqxTIahXvisPoBLzjo0gnikXxtrFakbexl1lxRSi`

/*
GET /some-endpoint HTTP/1.1
User-Agent: CompuServe Classic/1.22
Accept: application/json
Host: api.genius.com
Authorization: Bearer ACCESS_TOKEN
*/

$(document).ready(function () {
  $('#search-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    // console.log(result)

    const queryKey = result[0].value
    console.log(queryKey)
    const queryUrl = encodeURI(queryKey)
    const queryUrl2 = encodeURIComponent(queryKey)
    console.log(queryUrl)
    console.log(queryUrl2)
    this.reset()
    geniusSearchArtist(queryUrl)
  })
})

function geniusSearchArtist (term) {
  request.get(`https://api.genius.com/search?q=${term}`)
  // request.get(`https://api.genius.com/search`)
  //   .query({
  //     q: term
  //   })
    // .withCredentials()
    // .auth({'Authorization': 'Bearer ' + token})
    .set('Authorization', 'Bearer ' + token)
    .then(function (response) {
      console.log('type', typeof (response))
      console.log(response)
    })
}
