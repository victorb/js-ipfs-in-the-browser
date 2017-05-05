/* global browser, cloneInto */
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, args, cb) => {
  const listener = (m) => {
    let {err, res} = m
    cb(err, cloneInto(res, window, {cloneFunctions: true}))
    myPort.onMessage.removeListener(listener)
  }
  myPort.onMessage.addListener(listener)
  myPort.postMessage({method, args})
}

const ipfs = {
  id: (callback) => { makeCall('id', null, callback) },
  add: (args, callback) => { makeCall('add', args, callback) },
  cat: (args, callback) => { makeCall('cat', args, callback) }
}

// const cat = (hash, callback) => {
//   const stream = (function () {
//     this.on = (event, cb) => {
//       this.events[event] = cb
//     }
//     this.emit = (event, data) => {
//       this.events[event](data)
//     }
//     this.end = () => {
//       this.events.end()
//     }
//   })()
//   ipfs.cat(hash, (_, res) => {
//     callback(stream)
//     res.on('data', (data) => {
//       stream.emit('data', data)
//     })
//     res.on('end', stream.end.bind(this))
//   })
// }

// ipfs.cat('hash', (err, content) => {
//   const data = []
//   stream.on('data', (d) => {
//     data.push(d.toString())
//   })
//   stream.on('end', () => {
//     console.log(data.join(''))
//   })
// })

window.wrappedJSObject.ipfs = cloneInto(
  ipfs,
  window,
  {cloneFunctions: true})
