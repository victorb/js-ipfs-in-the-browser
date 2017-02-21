/* global browser */
// window.wrappedJSObject.ipfs = false
console.log('declared a public ipfs object!')

const myPort = browser.runtime.connect({name: 'port-from-cs'})

const makeCall = (method, cb) => {
  myPort.onMessage.addListener(function (m) {
    myPort.onMessage.removeListener(this)
    cb(m.response)
  })
  myPort.postMessage({method})
}

const createFunc = (method, callback) => {
  return () => {
    makeCall(method, callback)
  }
}

const ipfs = {
  id: (callback) => createFunc('id', callback)
}

window.ipfs = ipfs
// unsafeWindow.clonedContentScriptObject = cloneInto(ipfs, unsafeWindow)
// unsafeWindow.assignedContentScriptObject = ipfs;
