const IPFS = require('ipfs')
// const multiaddr = require('multiaddr')
// const series = require('async/series')
//
console.log('spawn-node.js')

function spawnNode (options, callback) {
  // options.path = options.path || '/ipfd/tmp/' + Math.random()
  console.log('starting node')
  // const node = new IPFS(options)
  const repoPath = 'ipfs-' + Math.random()
  node = new IPFS({
    repo: repoPath,
    config: {
      Addresses: {
        Swarm: [
          '/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss'
        ]
      }
    }
  })
  node.on('ready', () => {
    console.log('node ready')
    callback(null, node)
  })
  node.on('error', (err) => {
    console.log('node error')
    console.log(err)
    callback(err)
  })
  // const node = new IPFS(options)
  // series([
  //   (cb) => node.init({ emptyRepo: true, bits: 2048 }, (err) => {
  //     if (err) () => {}
  //     cb()
  //   }),
  //   // (cb) => {
  //     //
  //     // node.config.get((err, config) => {
  //     //   if (err) { return cb(err) }

  //     //   if (!multiaddr.isMultiaddr(multiaddr(options.signalAddr))) {
  //     //     return cb(new Error('non valid signalAddr, needs to be a multiaddr'))
  //     //   }

  //     //   const signalDomain = 'star-signal.cloud.ipfs.team'
  //     //   const wstarMultiaddr = `/libp2p-webrtc-star/dns/${signalDomain}/wss/ipfs/${config.Identity.PeerID}`

  //     //   config.Addresses.Swarm = [ wstarMultiaddr ]
  //     //   config.Discovery.MDNS.Enabled = false

  //     //   node.config.replace(config, cb)
  //     // })
  //   // },
  //   (cb) => node.load(cb),
  //   (cb) => node.goOnline(cb)
  // ], (err) => callback(err, node))
}

module.exports = spawnNode
