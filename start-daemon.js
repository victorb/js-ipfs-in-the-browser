/* global browser */
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

spawn({}, (err, ipfsNode) => {
  if (err) throw err

  browser.browserAction.setIcon({path: '/icons/ipfs.svg'})

  const methods = {
    'id': (send) => {
      console.log('method#id')
      ipfsNode.id((err, id) => {
        if (err) throw err
        console.log('responding')
        send(id)
      })
    }
  }

  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((m) => {
      if (methods[m.method] !== undefined) {
        console.log('can make this call')
        methods[m.method]((res) => {
          console.log('made it and responding!')
          port.postMessage(res)
        })
      }
    })
  })
})
