/* global browser, cloneInto */
// window.wrappedJSObject.ipfs = false
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, cb) => {
  myPort.onMessage.addListener(function (m) {
    // myPort.onMessage.removeListener(this)
    cb(cloneInto(m, window, {cloneFunctions: true}))
  })
  myPort.postMessage({method})
}

const ipfs = {
  id: (callback) => { makeCall('id', callback) }
}

// ipfs.id((id) => {
//   console.log('lol', id)
// })

window.wrappedJSObject.ipfs = cloneInto(
  ipfs,
  window,
  {cloneFunctions: true})

// window.ipfs = ipfs
// unsafeWindow.clonedContentScriptObject = cloneInto(ipfs, unsafeWindow)
// unsafeWindow.assignedContentScriptObject = ipfs;
