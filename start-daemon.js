/* global browser */
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

spawn({}, (err, ipfsNode) => {
  if (err) throw err

  browser.browserAction.setIcon({path: '/icons/ipfs.svg'})

  setInterval(() => {
    ipfsNode.swarm.peers((err, peers) => {
      if (err) throw err
      console.log(peers)
      const text = peers.length.toString()
      browser.browserAction.setBadgeText({text})
    })
  }, 1000)

  window.ipfs = ipfsNode
  const methods = {
    'id': (args, send) => {
      console.log('method#id')
      ipfsNode.id((err, id) => {
        if (err) throw err
        send(id)
      })
    },
    'add': (args, send) => {
      ipfsNode.files.add(new Buffer(args), (err, res) => {
        if (err) throw err
        send(res)
      })
    }
  }

  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((m) => {
      if (methods[m.method] !== undefined) {
        console.log('can make this call')
        methods[m.method](m.args, (res) => {
          console.log('made it and responding!')
          console.log(res)
          port.postMessage(res)
        })
      } else {
        throw new Error('Method ' + m.method + ' is currently not exposed')
      }
    })
  })
})
