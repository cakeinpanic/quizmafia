const fs = require('fs')
const fetch = require('node-fetch');
var path = require('path')

const { omit } = require('lodash')
const GAMES_FOLDER = 'games'
const SOURCE_FOLDER = 'sources'

//parseGame('sex')
parseGame('classics_19_may')
parseGame('history_21_may')

async function parseGame (gameName) {
  const initialJSON = require(`./${SOURCE_FOLDER}/${gameName}.json`)
  createFolder(gameName)

  const filteredQ = initialJSON.slides.filter(slide => slide.properties.type === 'question')
  const filteredA = initialJSON.slides.filter(slide => slide.properties.type === 'answer')
  const grouped = {}

  filteredQ.forEach(slide => {
    const qId = slide.id.split('-')[0]
    const { properties } = filteredA.find(answer => answer.id.indexOf(qId) === 0)
    grouped[qId] = {
      question: omit(slide.properties, ['markup', 'half', 'answer', 'type']),
      answer: omit(properties, ['markup', 'half', 'answer', 'type', 'question_growth', 'icon', 'autoplay'])
    }
  })

  for (let id of Object.keys(grouped)) {
    const { question, answer } = grouped[id]
    await downloadAllMedia(id, question, gameName)
    await downloadAllMedia(id, answer, gameName)

  }

  fs.writeFileSync(`${GAMES_FOLDER}/${gameName}/info_decoded.json`, JSON.stringify(grouped, null, 4).replace(/&nbsp;/g, ' '))
  console.log('finished');
}

async function downloadAllMedia (id, entitiy, gameName) {
  const media = ['image', 'secondImage', 'video', 'sounds']
  for (let mediaType of media) {
    await downloadMedia(id, mediaType, entitiy, gameName)
  }
}
function createFolder (name) {
  if (!fs.existsSync(GAMES_FOLDER)) {
    fs.mkdirSync(GAMES_FOLDER);
  }
  if (!fs.existsSync(`${GAMES_FOLDER}/${name}`)) {
    fs.mkdirSync(`${GAMES_FOLDER}/${name}`);
  }
}

async function downloadMedia (id, type, entity, gameName) {
  const media = entity[type]
  if (!media) {
    return
  }
  const extension = path.extname(media)
  const fileName = `${id}${extension}`
  await download(media, fileName, gameName)

  entity[type] = fileName
}

async function download (url, fileName, gameName) {
  const path = `${GAMES_FOLDER}/${gameName}/${fileName}`
  if (fs.existsSync(path)) {
    return
  }
  console.log(`downloading ${url} to ${path}`);
  const response = await fetch(url);
  const buffer = await response.buffer();

  fs.writeFileSync(path, buffer, () =>
    console.log(`finished ${fileName} downloading!`));
}

