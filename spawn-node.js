const IPFS = require('ipfs')
console.log('spawn-node.js')

function spawnNode (options, callback) {
  console.log('starting node')
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
}

module.exports = spawnNode
