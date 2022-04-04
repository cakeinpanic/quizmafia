const initialJSON = require('./info.json')
//const json = JSON.stringify(initialJSON, null, 2)
const fs = require('fs')
const fetch = require('node-fetch');

//
//
//const result = decodeURIComponent(json);
//fs.writeFileSync('./info_decoded.json',result)

const { omit } = require('lodash')
const filteredQ = initialJSON.slides.filter(slide => slide.properties.type === 'question')
const filteredA = initialJSON.slides.filter(slide => slide.properties.type === 'answer')
const grouped = {}

async function download (url, id) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  fs.writeFileSync(`img/${id}.jpg`, buffer, () =>
    console.log('finished downloading!'));
}

filteredQ.forEach(slide => {
  const qId = slide.id.split('-')[0]
  const { properties } = filteredA.find(answer => answer.id.indexOf(qId) === 0)
  grouped[qId] = {
    question: omit(slide.properties, ['markup', 'half', 'answer', 'type']),
    answer: omit(properties, ['markup', 'half', 'answer', 'type'])
  }
})

fs.writeFileSync('./info_decoded.json', JSON.stringify(grouped, null, 4).replace(/&nbsp;/g, ' '))

async function downloadImageForSlide(id){
  const { image } = grouped[id].question
  if (!image) {
    return
  }
  await download(image, id)
}
console.log(__dirname);
Object.keys(grouped).forEach(id => {
  downloadImageForSlide(id)
})
