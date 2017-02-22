/* global browser, cloneInto */
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, args, cb) => {
  const listener = (m) => {
    cb(cloneInto(m, window, {cloneFunctions: true}))
    myPort.onMessage.removeListener(listener)
  }
  myPort.onMessage.addListener(listener)
  myPort.postMessage({method, args})
}

const ipfs = {
  id: (callback) => { makeCall('id', null, callback) },
  add: (args, callback) => { makeCall('add', args, callback) }
}

window.wrappedJSObject.ipfs = cloneInto(
  ipfs,
  window,
  {cloneFunctions: true})
