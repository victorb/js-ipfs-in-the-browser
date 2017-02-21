/* global browser */
let node = null
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
spawn({}, (err, ipfsNode) => {
  if (err) throw err
  node = ipfsNode
})

const methods = {
  'id': (node, send) => {
    node.id((err, id) => {
      if (err) throw err
      send(id)
    })
  }
}

browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((m) => {
    if (methods[m.method] !== undefined) {
      methods[m.method](node, (res) => {
        port.postMessage({response: res})
      })
    }
  })
})

const handleErr = (err) => {
  console.log('Something threw an error')
  if (err) throw err
}

browser.tabs.query({}).then((tabs) => {
  console.log(tabs)
}, handleErr).catch(handleErr)

// var addonScriptObject = {"greeting" : "hello from add-on"};
// contentWindow.addonScriptObject = cloneInto(addonScriptObject, contentWindow);

browser.tabs.executeScript({
  file: '/page-script.js'
}).then(() => {
  console.log('injected')
}, handleErr).catch(handleErr)
