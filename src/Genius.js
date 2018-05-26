import $ from 'jquery'
import request from 'superagent'

$(document).ready(function () {
  $('#search-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    const queryUrl = encodeURI(queryKey)
    // const queryUrl2 = encodeURIComponent(queryKey)
    console.log(queryUrl)
    // console.log(queryUrl2)
    this.reset()
    geniusSearch(queryUrl)
  })
  $('#search-form-artistID').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    this.reset()
    geniusSearchArtist(queryKey)
  })
  $('#search-form-songID').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    this.reset()
    geniusSearchSongID(queryKey)
  })
})

function geniusSearch (term) {
  request.get(`http://localhost:8500/search?q=${term}`)
    .then(function (response) {
      // console.log(response)
      const geniusInfo = JSON.parse(response.text)
      // console.log('geniusinfo', geniusInfo)
      const geniusarray = geniusInfo.response.hits
      // console.log(geniusarray)
      getArtistId(geniusarray)
    })
}

function getArtistId (array) {
  const artistIds = []
  const primaryArtistName = []
  // console.log('array', array)
  for (var i = 0; i < array.length; i++) {
    // console.log(array[i])
    // console.log(jsonResult[i].result)
    artistIds.push(array[i].result.primary_artist.id)
    primaryArtistName.push(array[i].result.primary_artist.name)
  }
  console.log(artistIds)
  console.log(primaryArtistName)
  // checkRepeats(artistIds)
}

function checkRepeats (array) {
  const idandrepeat = []
  for (var i = 0; i < array.length; i++) {
    let test = array[i]
    let counter = 0
    for (i += 1; array.length > 0; i++) {
      if (test === array[i]) {
        console.log('array.presplice', array)
        array.splice(i, 1)
        counter += 1
        console.log('array', array)
        console.log('length', array.length)
        console.log('counter', counter)
      }
    }
    idandrepeat.push({test, counter})
    console.log('idrepeat', idandrepeat)
  }
  console.log(idandrepeat)
}

function geniusSearchArtist (term) {
  request.get(`http://localhost:8500/artists/${term}/songs`)
    .then(function (response) {
      console.log('SearchArtist response', response)
      const geniusInfo = JSON.parse(response.text)
      console.log('SearchArtist response-text', geniusInfo)
      const geniusarray = geniusInfo.response.songs
      console.log('SearchArtist array', geniusarray)
      songNames(geniusarray)
    })
}

function geniusSearchSongID (term) {
  request.get(`http://localhost:8500/songs/${term}`)
    .then(function (response) {
      console.log(response)
      const geniusInfo = JSON.parse(response.text)
      console.log('geniusinfo', geniusInfo)
      const geniusSong = geniusInfo.response.song
      console.log(geniusSong)
    })
}

function songNames (array) {
  const songNames = []
  for (var i = 0; i < array.length; i++) {
    let entry = array[i]
    songNames.push({'track': `${entry.full_title}`, 'id': entry.id})
  }
  console.log(songNames)
  return songNames
}
