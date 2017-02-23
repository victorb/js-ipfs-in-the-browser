const IPFS = require('ipfs')
const multiaddr = require('multiaddr')
const series = require('async/series')

function spawnNode (options, callback) {
  options.path = options.path || '/ipfd/tmp/' + Math.random()
  const node = new IPFS(options)
  series([
    (cb) => node.init({ emptyRepo: true, bits: 2048 }, (err) => {
      if (err) () => {}
      cb()
    }),
    (cb) => {
      node.config.get((err, config) => {
        if (err) { return cb(err) }

        if (!multiaddr.isMultiaddr(multiaddr(options.signalAddr))) {
          return cb(new Error('non valid signalAddr, needs to be a multiaddr'))
        }

        const signalDomain = 'star-signal.cloud.ipfs.team'
        const wstarMultiaddr = `/libp2p-webrtc-star/dns/${signalDomain}/wss/ipfs/${config.Identity.PeerID}`

        config.Addresses.Swarm = [ wstarMultiaddr ]
        config.Discovery = {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: true
          }
        }

        node.config.replace(config, cb)
      })
    },
    (cb) => node.load(cb),
    (cb) => node.goOnline(cb)
  ], (err) => callback(err, node))
}

module.exports = spawnNode
