const { of, create, from } = require('rxjs').Observable
const { JSDOM } = require('jsdom')
const base = '.'
exports.parse_card = data => {
   return create(observer => {
      let card_name = data.querySelector('tr:nth-child(1) > td#C2').textContent.trim()
      let card_number = data.querySelector('tr:nth-child(2) > td#C2').textContent.trim()
      let type = data.querySelector('tr:nth-child(4) > td#C2').textContent.trim()
      let id = card_number.toLowerCase().replace('-','_')
      let image = `${base}/images/card/${data.querySelector('tr:nth-child(1) > td#C0 img').name}.jpg`
      let abilitiesCollection = data.querySelector('tr:nth-child(7) > td#C2').childNodes
      let abilities = []
      Array.from(abilitiesCollection).forEach( (val, index) => {
         if(index % 2 == 0)
            abilities.push(val.textContent.trim())
      })

      observer.next({
         id,
         image,
         name:card_name,
         type,
         number:card_number,
         abilities})
      
      observer.complete()
   })
}

exports.convert_to_dynamo_json = ({id,image,name,number,abilities, type}) => {
   return {
      id:{
         S:id
      },
      image:{
         S:image
      },
      name:{
         S:name
      },
      number:{
         S:number
      },
      type:{
         S:type
      },
      abilities: {
         SS:abilities
      }
   }
      
}

exports.partition_expansion = data => {
   return of(new JSDOM(data))
      .map(dom => dom.window.document.querySelectorAll('td#T2 > table table tbody'))
}
