require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
const extension = require('extensionizer')
extension.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

let ipfs
extension.browserAction.setBadgeText({text: '...'})

spawn({}, (err, ipfsNode) => {
  if (err) throw err
    console.log('got node')

  ipfs = ipfsNode
  window.ipfsNode = ipfsNode
  const ID = ipfsNode._peerInfo.id._idB58String
  extension.browserAction.setIcon({path: '/icons/ipfs.svg'})

  extension.browserAction.setBadgeText({text: "0"})
  setInterval(() => {
    console.log('checking for peers')
    ipfs.swarm.peers((err, peers) => {
      if (err) throw err
      console.log('peers', peers)
      const text = peers.length.toString()
      extension.browserAction.setBadgeText({text})
    })
  }, 1000)

  // Toggle status of node
  // browser.browserAction.onClicked.addListener(() => {
  //   if (ipfsNode.isOnline().isOnline) {
  //     ipfsNode.goOffline(() => {
  //       browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})
  //       browser.browserAction.setBadgeText({text: 'Offline'})
  //     })
  //   } else {
  //     ipfsNode.goOnline(() => {
  //       browser.browserAction.setIcon({path: '/icons/ipfs.svg'})
  //     })
  //   }
  // })

  const seenWelcomeScreen = window.localStorage.getItem('seen-welcome-screen') || false

  console.log('seen welcome screen already?', seenWelcomeScreen)
  if (!seenWelcomeScreen) {
    extension.tabs.create({url: 'welcome-screen.html'})
    window.localStorage.setItem('seen-welcome-screen', true)
  }


  console.log('settings methods for communcation')
  const methods = {
    id: (args, send) => {
      ipfsNode.id((err, res) => {
        send({err, res})
      })
    },
    peers: (args, send) => {
      ipfsNode.swarm.peers((err, res) => {
        send({err, res})
      })
    },
    isOnline: (args, send) => {
      console.log('background checking if online')
      setImmediate(() => {
        send({err: null, res: ipfsNode._libp2pNode.isOnline})
      })
    },
    goOnline: (args, send) => {
      ipfsNode.start(() => {
        extension.browserAction.setIcon({path: '/icons/ipfs.svg'})
        send({err: null, res: true})
      })
    },
    goOffline: (args, send) => {
      ipfsNode.stop(() => {
        extension.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})
        extension.browserAction.setBadgeText({text: 'Offline'})
        send({err: null, res: true})
      })
    },
    swarmAddresses: () => {
      ipfsNode.config.get((err, config) => {
        let adddresses = []
        config.Addresses.Swarm.forEach((address) => {
          adddresses.push(address + '/ipfs/' + ID)
        })
        send({err, res: addresses})
      })
    },
    add: (args, send) => {
      ipfsNode.files.add(new Buffer(args), (err, res) => {
        send({err, res})
      })
    },
    cat: (args, send) => {
      // TODO right now we join all the data and send it
      // should be sending a stream instead
      ipfsNode.files.cat(args, (err, res) => {
        if (err) send({err})
        console.log('getting ', res)
        let data = ''
        res.on('data', (d) => {
          console.log('data ', d)
          data = data + d.toString()
        })
        res.on('end', () => {
          console.log('sending', data)
          send({err: null, res: data})
        })
      })
    }
  }

  console.log('setting up browser communication')
  extension.runtime.onConnect.addListener((port) => {
    console.log('got port, listening')
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
