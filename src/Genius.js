import $ from 'jquery'
import request from 'superagent'
import postscribe from 'postscribe'
import Twitter from './Twitter'

let ARTISTID = ''
let SONGID = ''
let TWITTERNAME = ''
// const noresultSRC = './media/no-genius_faded.png'
const noresultSRC = '/no-genius_faded.351f7402.png'

$(document).ready(function () {
  $('#search-form').submit(function (event) {
    event.preventDefault()
    const result = $(this).serializeArray()
    console.log(result)
    const artistkey = result[0].value
    const tweetlist = new Twitter(artistkey)
    tweetlist.twittersearch()
    const songvalue = result[1].value
    const songkey = convertCase(songvalue)
    const newGeniusSearch = new Genius(artistkey)
    this.reset()
    newGeniusSearch.geniusSearch()
    // sets ARTISTID, builds artist html
    setTimeout(function () {
      console.log('ran genius search artist')
      newGeniusSearch.geniusSearchArtist(ARTISTID)
      // creates artist html
      setTimeout(function () {
        newGeniusSearch.geniusSearchArtistforSongs(songkey)
        // sets SONGID
        setTimeout(function () {
          console.log('geniusSongID', SONGID)
          console.log('geniusSongID Boolean', Boolean(SONGID))
          if (SONGID) {
            newGeniusSearch.geniusSearchSongID(SONGID)
          } else {
            console.log('NO SONG ID')
            const innerHTML = newGeniusSearch.noDataResponse()
            console.log('NO SONG ID innerHTML', innerHTML)
            $('#lyrics').html(innerHTML)
            $('#songart').attr('src', noresultSRC)
          }
          // embeds lyrics and extracts data
          console.log('twitter?', TWITTERNAME)
        }, 1500)
      }, 1500)
    }, 1000)
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
        const geniusInfo = JSON.parse(response.text)
        const geniusarray = geniusInfo.response.hits
        self.getArtistId(geniusarray)
        // sets ARTISTID
      })
  }

  getArtistId (array) {
    console.log('ran get artist ID')
    const artistIds = []
    const primaryArtistName = []
    for (var i = 0; i < array.length; i++) {
      artistIds.push(array[i].result.primary_artist.id)
      primaryArtistName.push(array[i].result.primary_artist.name)
    }
    checkRepeats(artistIds)
  }

  geniusSearchArtistforSongs (string) {
    console.log('ran genius search artist for songs')
    const self = this
    request.get(`http://localhost:8500/artists/${ARTISTID}/songs/?sort=popularity&per_page=50`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        const geniusarray = geniusInfo.response.songs
        const songartistArray = self.filtersongNames(geniusarray)
        setTimeout(function () {
          const answer = self.ifcontains(songartistArray, string)
          SONGID = answer
          console.log('inside searchartist for songs, SONGID', SONGID)
        }, 400)
      })
  }
  geniusSearchArtist (ARTISTID) {
    const self = this
    console.log('ran genius search artst')
    request.get(`http://localhost:8500/artists/${ARTISTID}`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        const geniusarray = geniusInfo.response.artist
        // console.log(geniusarray)
        self.buildArtist(geniusarray)
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
    console.log('build artist- twittername', TWITTERNAME)
    if (name && altNames && htmlDesc && artistimage) {
      const innerHTML = `
        <h4 class="bio-name">${name}</h4>
        <small class="bio-alt">${altNames}</small>
        <br>
        <p class="bio-p">${htmlDesc}</p>`
      $('#artistimage').attr('src', artistimage)
      $('#artistinfo').html(innerHTML)
      $('#artistname').html(name)
    } else if (name && htmlDesc && artistimage) {
      const innerHTML = `
        <h4>${name}</h4>
        <br>
        <p>${htmlDesc}</p>
        `
      $('#artistimage').attr('src', artistimage)
      $('#artistinfo').html(innerHTML)
      $('#artistname').html(name)
    } else {
      const innerHTML = this.noDataResponse()
      $('#artistname').html('<i>Artist Not Found</i>')
      $('#artistinfo').html(innerHTML)
      $('#artistimage').attr('src', noresultSRC)
    }
  }

  ifcontains (arrayObj, string) {
    console.log('ran if contains')
    for (var song of arrayObj) {
      const trackname = song.track
      if (trackname.includes(string)) {
        console.log('track was listed')
        return song.id
      }
    }
  }

  geniusSearchSongID (SONGID) {
    const self = this
    request.get(`http://localhost:8500/songs/${SONGID}`)
      .then(function (response) {
        const geniusInfo = JSON.parse(response.text)
        const geniusSong = geniusInfo.response.song
        self.getData(geniusSong)
        const lyricsEmbed = self.makeEmbed(geniusSong)
        if (geniusInfo && geniusSong && lyricsEmbed) {
          postscribe('#lyrics', lyricsEmbed)
          // $('#lyrics').html(lyricsEmbed)
        } else {
          const innerHTML = this.noDataResponse()
          $('#lyrics').html(innerHTML)
        }
      })
  }

  filtersongNames (array) {
    console.log('ran filter song names')
    const songNames = []
    for (var i = 0; i < array.length; i++) {
      let entry = array[i]
      songNames.push({
        'track': `${entry.full_title}`,
        'id': entry.id
      })
    }
    return songNames
  }

  getData (songEntry) {
    console.log('RAN THE GETTING OF DATA')
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
    if (!(songEntry.album)) {
      const innerHTML = this.noDataResponse()
      $('#albuminfo').html(innerHTML)
      $('#albumart').attr('src', noresultSRC)
    }

    // console.log('song desc', songDescription)
    const htmlDesc = this.convertDescription(songDescription)
    $('#songinfo').html(htmlDesc)
  }
  convertDescription (array) {
    console.log('DESCRIPTION array', array)
    const paragraph = []
    for (var entry of array) {
      console.log('entry of array', entry)
      if (entry) {
        if (entry.tag === 'p') {
          let childarray = entry.children
          for (var i = 0; i < childarray.length; i++) {
            let childentry = childarray[i]
            if (typeof (childentry) === 'string') {
              paragraph.push(childentry)
            } else if (typeof (childentry) === 'object') {
              if (childentry.tag === 'i' || childentry.tag === 'em') {
                paragraph.push(childentry.children)
              }
              if (childentry.tag === 'a') {
                console.log('childentry', Boolean((childentry.tag === 'a')), childentry)
                if (childentry.attributes.hasOwnProperty('rel')) {
                  console.log('children includes http')
                } else {
                  console.log('no href, has children', childentry.children)
                  let baby = childentry.children
                  paragraph.push(baby[0])
                }
              }
            } else if (Array.isArray(childentry)) {
              for (var x of childentry) {
                if (typeof (x.children) === 'string') {
                  paragraph.push(x.children)
                }
              }
            }
          }
        }
      }
    }
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

  noDataResponse () {
    return `
    <div class="image">
      <img class="noresult" src="/no-genius_faded.351f7402.png">
    </div>`
  }
}

const idandrepeat = []

function checkRepeats (array) {
  let test = array[0]
  let counter = 0
  for (var i = 0; i < array.length; i++) {
    if (test === array[i]) {
      array.splice((i), 1)
      counter += 1
      i -= 1
    } else {
      console.log('different', array[i])
    }
  }
  idandrepeat.push({
    'theID': test,
    'count': counter
  })
  if (array.length > 0) {
    return checkRepeats(array)
  } else {
    console.log(getMaxCount(idandrepeat))
    const thewinner = getMaxCount(idandrepeat)
    console.log(thewinner.theID)
    ARTISTID = thewinner.theID
    // return thewinner.theID
  }
}

function getMaxCount (arrayObjects) {
  const max = arrayObjects.reduce((prev, current) => (prev.count > current.count) ? prev : current, 1)
  return max
}

function convertCase (string) {
  let stringArray = string.split(' ')
  for (var i of stringArray) {
    var lowercase = i.substr(1)
    var uppercase = i.charAt(0).toUpperCase()
    var newWord = uppercase + lowercase
    var indexnumb = stringArray.indexOf(i)
    stringArray.splice(indexnumb, 1, newWord)
  }
  return stringArray.join(' ')
}
