import $ from 'jquery'
import request from 'superagent'
import postscribe from 'postscribe'

let SONGID = ''
let TWITTERNAME = ''
$(document).ready(function () {
  $('#search-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    // const queryUrl = encodeURI(queryKey)
    // const queryUrl2 = encodeURIComponent(queryKey)
    // console.log(queryUrl)
    // console.log(queryUrl2)
    this.reset()
    const newGeniusSearch = new Genius(queryKey)
    // const geniusSearchResults = newGeniusSearch.geniusSearch()
    newGeniusSearch.geniusSearch()
  })
  $('#search-form-artistID').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    this.reset()
    const geniusArtist = new Genius(queryKey)
    geniusArtist.geniusSearchArtist()
    // geniusArtist.geniusSearchArtistforSongs('A Milli')
    // setTimeout(function () {
    //   console.log('geniusSongID', SONGID)
    // }, 500)
    // geniusSearchArtist(queryKey)
  })
  $('#search-form-songID').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    const queryKey = result[0].value
    this.reset()
    const geniusSong = new Genius(queryKey)
    // geniusSearchSongID(queryKey)
    // const geniusSongResults = geniusSong.geniusSearchSongID()
    geniusSong.geniusSearchSongID()
  })
})

class Genius {
  constructor (searchterm) {
    this.term = searchterm
  }

  convertURL () {
    return encodeURI(this.term)
  }

  geniusSearch () {
    this.search = this.convertURL()
    const self = this
    request.get(`http://localhost:8500/search?q=${this.search}&sort=popularity`)
      .then(function (response) {
        // console.log(response)
        const geniusInfo = JSON.parse(response.text)
        // console.log('geniusinfo', geniusInfo)
        const geniusarray = geniusInfo.response.hits
        // console.log(geniusarray)
        self.getArtistId(geniusarray)
        // console.log(result)
      })
  }

  getArtistId (array) {
    // console.log(array)
    const artistIds = []
    const primaryArtistName = []
    for (var i = 0; i < array.length; i++) {
      artistIds.push(array[i].result.primary_artist.id)
      primaryArtistName.push(array[i].result.primary_artist.name)
    }
    // console.log(artistIds)
    // console.log(primaryArtistName)
    checkRepeats(artistIds)
  }

  geniusSearchArtistforSongs (string) {
    const self = this
    request.get(`http://localhost:8500/artists/${self.term}/songs/?sort=popularity&per_page=50`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        const geniusarray = geniusInfo.response.songs
        // const songartistArray = self.filtersongNames(geniusarray)
        // SONGID = self.ifcontains(songartistArray, string)
      })
  }
  geniusSearchArtist () {
    const self = this
    request.get(`http://localhost:8500/artists/${self.term}`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        // console.log(geniusInfo)
        const geniusarray = geniusInfo.response.artist
        console.log(geniusarray)
        self.buildArtist(geniusarray)

        // const songartistArray = self.filtersongNames(geniusarray)
        // SONGID = self.ifcontains(songartistArray, string)
      })
  }

  buildArtist (object) {
    const name = object.name
    const twittername = object.twitter_name
    TWITTERNAME = twittername
    const altNameArray = object.alternate_names
    const altNames = altNameArray.join(', ')
    const artistimage = object.image_url
    const artistDescription = object.description.dom.children
    const htmlDesc = this.convertDescription(artistDescription)
    console.log(TWITTERNAME)
    $('#artistimage').attr('src', artistimage)
    const innerHTML = `
    <h4>${name}</h4>
    <small>${altNames}</small>
    <br>
    <p>${htmlDesc}</p>
    `
    $('#artistinfo').html(innerHTML)
  }

  ifcontains (arrayObj, string) {
    console.log('ran if contains')
    // if (string === '') {
    //   string = 'A Milli'
    // }
    for (var song of arrayObj) {
      // console.log('song', song)
      const trackname = song.track
      // console.log('trackname', trackname)
      // console.log('type', typeof (trackname))
      if (trackname.includes(string)) {
        // console.log('STRINGADINGING', string)
        // console.log(song)
        // console.log(song.id)
        return song.id
      }
    }
  }

  geniusSearchSongID () {
    const self = this
    request.get(`http://localhost:8500/songs/${self.term}`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        const geniusSong = geniusInfo.response.song
        // console.log('the genius SOng', geniusSong)
        self.getData(geniusSong)
        const lyricsEmbed = self.makeEmbed(geniusSong)
        // console.log('lyricsEmbed', lyricsEmbed)
        postscribe('#lyrics', lyricsEmbed)
        // $('#lyrics').html(lyricsEmbed)
      })
  }

  filtersongNames (array) {
    const songNames = []
    for (var i = 0; i < array.length; i++) {
      let entry = array[i]
      songNames.push({'track': `${entry.full_title}`, 'id': entry.id})
    }
    // console.log(songNames)
    return songNames
  }

  getData (songEntry) {
    // console.log('songEntry', typeof (songEntry), songEntry)
    // console.log(Object.keys(songEntry))
    const songTitle = songEntry.title
    // "A Certain Comfort"
    const songFullTitle = songEntry['full_title']
    // "A Certain Comfort by Tech N9ne (Ft. Kate Rose)"
    $('#songtitle').html(songFullTitle)
    const songGeniusId = songEntry.id
    // 1780030  3706190
    const primaryArtist = songEntry.primary_artist.name
    // "Tech N9ne" id 506
    $('#artistname').html(primaryArtist)
    const mediaArray = songEntry.media
    // applemusic, spotify and soundcloud
    const lyricsUrl = songEntry.url
    const songArtUrl = songEntry.song_art_image_url
    // also song_art_image_thumbnail_url or header_image_url
    $('#songart').attr('src', songArtUrl)
    const songDescription = songEntry.description.dom.children
    // p arrays
    if (songEntry.album) {
      // console.log('songEntry after desc', songEntry.album)
      // console.log('album keys', Object.keys(songEntry.album))
      const albumFullTitle = songEntry.album.full_title
      // "Special Effects by Tech N9ne"
      const albumTitle = songEntry.album.name
      // "Special Effects"
      $('#albuminfo').html(albumFullTitle)
      const albumArt = songEntry.album.cover_art_url
      $('#albumart').attr('src', albumArt)
    }

    console.log('song desc', songDescription)
    const htmlDesc = this.convertDescription(songDescription)
    $('#songinfo').html(htmlDesc)
  }

  convertDescription (array) {
    console.log('array', array)
    const paragraph = []
    for (var entry of array) {
      console.log('entry of array', entry)
      if (entry) {
        if (entry.tag === 'p') {
          let childarray = entry.children
          console.log('childarray', childarray)
          for (var i = 0; i < childarray.length; i++) {
            // console.log('i', typeof (childarray[i]), childarray[i])
            let childentry = childarray[i]
            console.log('childentry', childentry)
            console.log('childentry type', typeof (childentry))
            console.log(Boolean(typeof (childentry) === 'object'))
            if (typeof (childentry) === 'string') {
              paragraph.push(childentry)
            } else if (typeof (childentry) === 'object') {
              if (childentry.tag === 'i' || childentry.tag === 'em') {
                paragraph.push(childentry.children)
              }
              if (childentry.tag === 'a') {
                if (childentry.attributes.hasOwnProperty('href')) {
                } else {
                  paragraph.push(childentry.children[0])
                }
              }
            } else if (Array.isArray(childentry)) {
              for (var x of childentry) {
                // console.log('x', x)
                if (typeof (x.children) === 'string') {
                  paragraph.push(x.children)
                }
              }
            }
          }
        }
      }
    }
    // console.log('paragraph', paragraph)
    const completeDescription = paragraph.join('')
    console.log(completeDescription)
    return completeDescription
  }

  makeEmbed (songEntry) {
    const songid = songEntry.id
    const songUrl = songEntry.url
    const songFullTitle = songEntry['full_title']
    return `<div id='rg_embed_link_${songid}' class='rg_embed_link' data-song-id='${songid}'>Read <a href='${songUrl}'>"${songFullTitle}"</a> on Genius</div> <script crossorigin src='//genius.com/songs/${songid}/embed.js'></script>`
  }
}

// function geniusSearch (term) {
//   request.get(`http://localhost:8500/search?q=${term}`)
//     .then(function (response) {
//       // console.log(response)
//       const geniusInfo = JSON.parse(response.text)
//       // console.log('geniusinfo', geniusInfo)
//       const geniusarray = geniusInfo.response.hits
//       // console.log(geniusarray)
//       getArtistId(geniusarray)
//     })
// }

// function getArtistId (array) {
//   const artistIds = []
//   const primaryArtistName = []
//   for (var i = 0; i < array.length; i++) {
//     artistIds.push(array[i].result.primary_artist.id)
//     primaryArtistName.push(array[i].result.primary_artist.name)
//   }
//   console.log(artistIds)
//   console.log(primaryArtistName)
//   // checkRepeats(artistIds)
// }
const idandrepeat = []
function checkRepeats (array) {
  let test = array[0]
  let counter = 0

  for (var i = 0; i < array.length; i++) {
    // console.log('value', array[i], 'index', i)
    // console.log('array length', array.length)
    if (test === array[i]) {
      // console.log('array.presplice', array)
      array.splice((i), 1)
      counter += 1
      i -= 1
      // console.log('array', array)
      // console.log('length', array.length)
      // console.log('counter', counter)
      // console.log('=======+========')
    } else {
      console.log('different', array[i])
      // console.log('=======+========')
    }
  }
  idandrepeat.push({'theID': test, 'count': counter})
  // console.log('idrepeat', idandrepeat)
  // console.log(array.length)
  if (array.length > 0) {
    return checkRepeats(array)
  } else {
    // console.log(idandrepeat)
    console.log(getMaxCount(idandrepeat))
    const thewinner = getMaxCount(idandrepeat)
    console.log(thewinner.theID)
    return thewinner.theID
  }
}

function getMaxCount (arrayObjects) {
  const max = arrayObjects.reduce((prev, current) => (prev.count > current.count) ? prev : current, 1)
  return max
}
// function geniusSearchArtist (term) {
//   request.get(`http://localhost:8500/artists/${term}/songs`)
//     .then(function (response) {
//       const geniusInfo = JSON.parse(response.text)
//       const geniusarray = geniusInfo.response.songs
//       songNames(geniusarray)
//     })
// }

// function geniusSearchSongID (term) {
//   request.get(`http://localhost:8500/songs/${term}`)
//     .then(function (response) {
//       const geniusInfo = JSON.parse(response.text)
//       const geniusSong = geniusInfo.response.song
//       console.log(geniusSong)
//     })
// }

// function songNames (array) {
//   const songNames = []
//   for (var i = 0; i < array.length; i++) {
//     let entry = array[i]
//     songNames.push({'track': `${entry.full_title}`, 'id': entry.id})
//   }
//   console.log(songNames)
//   return songNames
// }
