#!/usr/bin/env node

const fs = require('fs')
// const spawn = require('child_process').spawn

const [ , , url ] = process.argv
const [ protocol ] = url ? url.match(/(https|http)/g) : []

if (!protocol) {
  return console.error('Should provide a valid url!')
}

// const spawnDl = () =>
//   spawn('youtube-dl', ['-io', `%(autonumber)s-%(title)s.%(ext)s`, '-a', 'links'])

require(protocol)
  .get(url, (res) => {
    res.setEncoding('utf8')
    let html = ''
    res.on('data', (chunk) => html += chunk)
    res.on('end', () => {
      // TODO: Looks really messy and unstable, do better.
      const links = html.split('\n')
        .filter((l) => l.includes('<h4 class="title"><a'))
        .map((t) => t.split('"')[3])
        .join('\n')

      fs.writeFile(
        'links', links, (err) => {
          if (err) return console.error('Error on file write #', err)
          console.log('Done :)')
        }
      )

    })
  })
  .on('error', (err) => {
    console.error('Download error #', err)
  })
