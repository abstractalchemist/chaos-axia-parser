const { create_table, delete_table, insert_into_table, put_item } = require('aws-interface')
const { parse_card, partition_expansion } = require('./index')
const { create,of, from } = require('rxjs').Observable
const fs = require('fs')

const read_file = filename => {
   return create(observer => {
      fs.readFile(filename, 
         (err, data) => {
            if(err) observer.error(err)
            else {
               observer.next(data)
               observer.complete()
            
            }
         })
   })
}


// script to create and insert new tables for series
if(!process.env.CREDENTIALS_FILE && !process.env.ENDPOINT)
   throw new Error("We're in production mode, please provide root credentials file via CREDENTIALS_FILE variable")
if(process.env.NODE_ENV !== 'production')
   throw new Error(`We're in production if we're running this file, please set this via NODE_ENV, currently ${typeof process.env.NODE_ENV}`)

const process_data = (table_name, label, prefix, filename) => {
   const add_to_sets = _ => put_item('card_sets', {id:table_name, label, prefix})
   return delete_table(table_name)
      .catch(e => {
         return of("")
      })
      .mergeMap(_ => create_table(table_name, {id:'S'}))
      .mergeMap(_ => read_file(filename)
         .mergeMap(partition_expansion)
         .mergeMap(from)
         .mergeMap(parse_card)
         .reduce(
            (R,V) => {
               R.push(V)
               return R
            }, [])
         .mergeMap(data => {
            return insert_into_table(table_name, data)
               .reduce(
                  (R,V) => {
                     return R
                  }, [])
               .map(_ => "")
//               .mergeMap(add_to_sets)
         })
     )
}

console.time('touhou')
process_data('touhou_chaotic_mark_ESOD', '東方混沌符【紅魔篇】', '紅魔', './esod.html')
   .do(data => console.log('processing of ESoD complete <' + data + '>'))
   .mergeMap(_ => {
      return create(observer => {
         console.time('PCB')
         setTimeout(_ => {
            console.timeEnd('PCB')
            process_data('touhou_chaotic_mark_PCB','東方混沌符【妖々篇】','妖々','./pcb.html')
               .subscribe(observer)
         }, 1000)
     })
  })
  .do(_ => console.log('processing of PCB complete'))
  .mergeMap(_ => {
      return create(observer => {
         console.time('IMP')
         setTimeout(_ => {
            console.timeEnd('IMP')
            process_data('touhou_chaotic_mark_IMP','東方混沌符【永夜篇】','永夜','./imp.html')
               .subscribe(observer)
         }, 1000)
      })
  })
  .do(_ => console.log('processing of IMP complete'))
  .subscribe(
      data => {},
      console.log.bind(console),
      _ => {
         console.log('touhou processing complete')
         console.timeEnd('touhou')
      })

