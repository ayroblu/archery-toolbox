import {convergeFunc} from './converger'

describe('Converges', ()=>{
  [
    ['basic', 0, 0.1, 5]
  ].forEach(([name, initialVal, inc, expected])=>{
    test(name, ()=>{
      const result = convergeFunc(val=>{
        return {isLower: val < expected}
      }, initialVal, inc)
      expect(result < expected + 1e-3 && result > expected - 1e-3).toBeTruthy()
    })
  })
})
