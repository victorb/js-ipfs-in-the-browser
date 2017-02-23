/* global browser */
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

spawn({}, (err, ipfsNode) => {
  if (err) throw err

  browser.browserAction.setIcon({path: '/icons/ipfs.svg'})

  setInterval(() => {
    if (ipfsNode.isOnline().isOnline) {
      ipfsNode.swarm.peers((err, peers) => {
        if (err) throw err
        console.log(peers)
        const text = peers.length.toString()
        browser.browserAction.setBadgeText({text})
      })
    }
  }, 1000)

  browser.browserAction.onClicked.addListener(() => {
    if (ipfsNode.isOnline().isOnline) {
      ipfsNode.goOffline(() => {
        browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})
        browser.browserAction.setBadgeText({text: 'Offline'})
      })
    } else {
      ipfsNode.goOnline(() => {
        browser.browserAction.setIcon({path: '/icons/ipfs.svg'})
      })
    }
  })

  window.ipfs = ipfsNode
  const methods = {
    'id': (args, send) => {
      console.log('method#id')
      ipfsNode.id((err, id) => {
        send({err, res: id})
      })
    },
    'add': (args, send) => {
      ipfsNode.files.add(new Buffer(args), (err, res) => {
        send({err, res})
      })
    },
    'cat': (args, send) => {
      ipfsNode.files.cat(args, (err, res) => {
        let data = ''
        res.on('data', (d) => {
          data = data + d.toString()
        })
        res.on('end', () => {
          send({err, res: data})
        })
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
