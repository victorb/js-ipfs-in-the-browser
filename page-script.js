/* global browser, cloneInto */
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, cb) => {
  myPort.onMessage.addListener(function (m) {
    cb(cloneInto(m, window, {cloneFunctions: true}))
  })
  myPort.postMessage({method})
}

const ipfs = {
  id: (callback) => { makeCall('id', callback) }
}

window.wrappedJSObject.ipfs = cloneInto(
  ipfs,
  window,
  {cloneFunctions: true})
