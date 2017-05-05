/* global browser */
require('setimmediate') // TODO js-ipfs fails without this in the ID call
const spawn = require('./spawn-node.js')
browser.browserAction.setIcon({path: '/icons/ipfs-offline.svg'})

var pattern = "https://ipfs.io/ipfs/*";

function redirect(requestDetails) {
  console.log("Redirecting: " + requestDetails.url);
  var makeItGreen = 'document.write("heeey")';
  var executing = browser.tabs.executeScript({
    code: makeItGreen
  });
  return {
    cancel: true
    // redirectUrl: "https://38.media.tumblr.com/tumblr_ldbj01lZiP1qe0eclo1_500.gif"
  };
}

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls:[pattern]},
  ["blocking"]
);

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

  const showWelcome = window.localStorage.getItem('showed-welcome-screen') || false

  console.log('should show welcome?', showWelcome)
  if (!showWelcome) {
  browser.tabs.create({url: 'welcome-screen.html'})
    window.localStorage.setItem('showed-welcome-screen', true)
  }

  window.ipfs = ipfsNode
  const methods = {
    id: (args, send) => {
      ipfsNode.id((err, id) => {
        send({err, res: id})
      })
    },
    peers: (args, send) => {
      ipfsNode.swarm.peers((err, peers) => {
        send({err, res: peers})
      })
    },
    isOnline: (args, send) => {
      setImmediate(() => {
        send({err: null, res: ipfsNode.isOnline().isOnline})
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
        res.on('data', (data) => {
          send({data})
        })
        res.on('end', () => {
          send(null)
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
