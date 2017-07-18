import {cn} from './'

describe('Returns a class names list', ()=>{
  [
    ['simple array', ['First', 'Second'], 'First Second']
  , ['conditional false', ['First', false && 'Second'], 'First']
  , ['conditional true', ['First', true && 'Second'], 'First Second']
  ].forEach(([name, param, expected])=>{
    test(name, ()=>{
      expect(cn.apply(null, param)).toEqual(expected)
    })
  })
})
