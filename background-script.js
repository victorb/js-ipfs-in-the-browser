/* global browser */
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

// var pattern = "https://ipfs.io/ipfs/*";
// 
// function redirect(requestDetails) {
//   console.log("Redirecting: " + requestDetails.url);
//   var makeItGreen = 'document.write("heeey")';
//   var executing = browser.tabs.executeScript({
//     code: makeItGreen
//   });
//   return {
//     cancel: true
//     // redirectUrl: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"
//   };
// }
// 
// browser.webRequest.onBeforeRequest.addListener(
//   redirect,
//   {urls:[pattern]},
//   ["blocking"]
// );

let ipfs

browser.browserAction.setBadgeText({text: '...'})
spawn({}, (err, ipfsNode) => {
  if (err) throw err
    console.log('got node')

  ipfs = ipfsNode
  window.ipfsNode = ipfsNode
  browser.browserAction.setIcon({path: '/icons/ipfs.svg'})

  browser.browserAction.setBadgeText({text: "0"})
  setInterval(() => {
    console.log('checking for peers')
    // ipfs.isOnline((isOnline) => {
      // if (isOnline) {
        // console.log('am online')
        ipfs.swarm.peers((err, peers) => {
          if (err) throw err
          console.log('peers', peers)
          const text = peers.length.toString()
          browser.browserAction.setBadgeText({text})
        })
    //   } else {
    //     console.log('offline :/')
    //     browser.browserAction.setBadgeText({text: 'Offline'})
    //   }
    // })
  }, 5000)

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
    browser.tabs.create({url: 'welcome-screen.html'})
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
      // setImmediate(() => {
      ipfsNode.isOnline((err, res) => {
        send({err, res})
      })
    },
    add: (args, send) => {
      ipfsNode.files.add(new Buffer(args), (err, res) => {
        send({err, res})
      })
    },
    cat: (args, send) => {
      ipfsNode.files.cat(args, (err, res) => {
        if (err) send({err})
        let data = ''
        res.on('data', (d) => {
          data = data + d.toString()
          // data.push(d.toString())
          // send({data})
        })
        res.on('end', () => {
          send({err: null, res: data})
        })
      })
    }
  }

  console.log('setting up browser communication')
  browser.runtime.onConnect.addListener((port) => {
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
