/* global browser */

const IPFS = require('ipfs')
const bl = require('bl')

browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

const repoPath = 'ipfs-webext-' + Math.random()

const node = new IPFS({
  repo: repoPath,
  config: {
    Addresses: {
      Swarm: [
        '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
      ]
    }
  }
})

node.on('err', (err) => {
  console.log('Error spawning the node', err)
  browser.browserAction.setIcon({ path: '/icons/offline.svg' })
})

node.on('ready', () => {
  window.ipfs = node

  browser.browserAction.setIcon({ path: '/icons/online.svg' })

  setInterval(() => {
    if (node.isOnline()) {
      node.swarm.peers((err, peers) => {
        if (err) {
          console.log('Error on swarm.peers', err)
        }

        const nPeers = peers.length.toString()
        browser.browserAction.setBadgeText({nPeers})
      })
    }
  }, 1000)

  browser.browserAction.onClicked.addListener(() => {
    if (node.isOnline()) {
      node.stop(() => {
        browser.browserAction.setIcon({path: '/icons/offline.svg'})
        browser.browserAction.setBadgeText({text: 'Offline'})
      })
    } else {
      node.start(() => {
        browser.browserAction.setIcon({path: '/icons/online.svg'})
      })
    }
  })

  const methods = {
    'id': (args, send) => {
      node.id((err, id) => send({err: err, res: id}))
    },
    'add': (args, send) => {
      node.files.add(Buffer.from(args), (err, res) => send({err: err, res: res}))
    },
    'cat': (args, send) => {
      node.files.cat(args, (err, stream) => {
        if (err) {
          send({ err: err })
        }
        stream.pipe(bl((err, data) => send({ err: err, res: data })))
      })
    }
  }

  browser.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((m) => {
      if (methods[m.method] !== undefined) {
        methods[m.method](m.args, (res) => port.postMessage(res))
      } else {
        throw new Error('Method ' + m.method + ' is currently not exposed')
      }
    })
  })
})
