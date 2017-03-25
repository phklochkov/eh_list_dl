#!/usr/bin/env node

const fs = require('fs')

const getProtocol = (url) => {
  const [ protocol ] = url.match(/(https|http)/g)

  return protocol
}

const fileWrite = (...args) => {
  const [ links, path ] = args
  if (!path) {
    process.stdout.write(links)
    return
  }

  fs.writeFile(`${path}/links`, links, (err) => {
    if (err) return console.error('Error on file write #', err)
  })
}

const getLinks = (url) => {
  require(getProtocol(url)).get(url, (res) => {
    res.setEncoding('utf8')
    let html = ''
    res.on('data', (chunk) => html += chunk)
    res.on('end', () => {
      // TODO: Looks really messy and unstable, do better.
      const links = html.split('\n')
        .filter((l) => l.includes('<h4 class="title"><a'))
        .map((t) => t.split('"')[3])
        .join('\n')

      const pathIdx = process.argv.indexOf('-o') + 1
      fileWrite(links, pathIdx && process.argv[pathIdx])
    })
  })
  .on('error', (err) => {
    console.error('Download error #', err)
  })
}

if (process.argv.includes('-v') || process.argv.length === 2) {
  const info = `
    Egghead video links downloader, version 0.1.0
    Omit flags to get links in stdin
    Use -o and specify output folder to create links file - 
    app -o ~/videos https://your_url.com
  `
  console.log(info)

  return
}

const url = process.argv.find((a) => /^http[s]?/.test(a))
if (!url) {
  process.exitCode = 1
  return console.error('Please provide a valid url')
}

getLinks(url)
