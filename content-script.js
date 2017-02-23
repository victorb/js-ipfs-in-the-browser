/* global browser, cloneInto */
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, args, cb) => {
  const listener = (m) => {
    let {err, res} = m
    if (res.on !== undefined) {
      console.log('I think I got a stream')
      console.log(res)
    }
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

window.wrappedJSObject.ipfs = cloneInto(
  ipfs,
  window,
  {cloneFunctions: true})
