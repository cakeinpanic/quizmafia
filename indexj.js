const initialJSON = require('./info.json')
//const json = JSON.stringify(initialJSON, null, 2)
const fs = require('fs')
//
//
//const result = decodeURIComponent(json);
//fs.writeFileSync('./info_decoded.json',result)

const { omit } = require('lodash')
const filteredQ = initialJSON.slides.filter(slide => slide.properties.type === 'question')
const filteredA = initialJSON.slides.filter(slide => slide.properties.type === 'answer')
const grouped = {}
filteredQ.forEach(slide => {
  const qId = slide.id.split('-')[0]
  const {  type, properties } = filteredA.find(answer => answer.id.indexOf(qId) === 0)
  grouped[qId] = {
    question: omit(slide.properties, ['markup', 'half', 'answer', 'type'])
  , answer:  omit(properties, ['markup', 'half','answer', 'type'])
  }
})

fs.writeFileSync('./info_decoded.json', JSON.stringify(grouped, null, 4).replace(/&nbsp;/g, ' '))
