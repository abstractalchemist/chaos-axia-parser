const { expect } = require('chai')
const { partition_expansion, parse_card, convert_to_dynamo_json } = require('../src/index')
const { readFile } = require('fs')
const { create, from } = require('rxjs').Observable
const { JSDOM } = require('jsdom')
describe('Chaos Axia Parser', function() {
   it('test it', function() {
      expect(true).to.be.true
   })

   it('test parse card', async function() {
      const result = await create(observer => {
         readFile('./single.html',
            (err, contents) => {
               if(err) observer.error(err)
               else {
                  observer.next(contents)
                  observer.complete()
               }
            })
           
      })
         .map(data => JSDOM.fragment(data))
         .map(dom => dom.querySelector('table table tbody'))
         .mergeMap(parse_card)
         .toPromise()

      expect(result).to.have.property('id')
      expect(result).to.have.property('type')
      expect(result.id).to.equal('紅魔_001sp')
      expect(result.image).to.equal('./images/card/ko001s.jpg')
   })

   it('test export to dynamo', function() {
      const result = convert_to_dynamo_json({id:'0',number:'1',name:'test card',image:'not here', abilities:['foo','bar']})
      expect(result.id).to.have.property('S')
      expect(result.abilities).to.have.property('SS')
   })

   it('test partition expansion', async function() {
      const result = await create(observer => {
         readFile('./esod.html',
            (err, content) => {
               if(err) observer.error(err)
               else {
                  observer.next(content)
                  observer.complete()
               }
            })
      })
         .mergeMap(partition_expansion)
         .mergeMap(from)
         .mergeMap(parse_card)
         .map(convert_to_dynamo_json)
         .reduce(
            (R,V) => {
               R.push(V)
               return R
            }, [])

         .toPromise()
      expect(result).to.have.lengthOf(91)
   })
})
