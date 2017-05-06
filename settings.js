const $id = document.querySelector('.id')
const $status = document.querySelector('.status')
const $peers = document.querySelector('.peers')
const $peerIDs = document.querySelector('.peer-ids')
const $goOffline = document.querySelector('.go-offline')
const $goOnline = document.querySelector('.go-online')
const myPort = browser.runtime.connect({name: 'port-from-cs'})


const makeCall = (method, args, cb) => {
  const listener = (m) => {
    let {err, res} = m
    myPort.onMessage.removeListener(listener)
    console.log(res)
    cb(err, res)
  }
  myPort.onMessage.addListener(listener)
  myPort.postMessage({method, args})
}

const ipfs = {
  id: (callback) => { makeCall('id', null, callback) },
  peers: (callback) => { makeCall('peers', null, callback) },
  swarmAddresses: () => { makeCall('swarmAddresses', null, callback) },
  isOnline: (callback) => { makeCall('isOnline', null, callback) },
  goOffline: (callback) => { makeCall('goOffline', null, callback) },
  goOnline: (callback) => { makeCall('goOnline', null, callback) }
}

const setID = (newID) => {
  $id.innerText = newID
}

const setStatus = (isOnline) => {
  const text = isOnline ? 'Online' : 'Offline'
  $status.innerText = text
}

const setNumberOfPeers = (numberOfPeers) => {
  $peers.innerText = numberOfPeers
}
const setPeers = (peers) => {
  $peerIDs.innerHTML = null
  let newContent = ''
  peers.forEach((peer) => {
    id = peer.peer.id._idB58String
    newContent = newContent + `<div>${id}</div>`
  })
  $peerIDs.innerHTML = newContent
}

const updateStatus = () => {
  ipfs.id((err, res) => {
    if (err) throw err
    setID(res.id)
    console.log('checking if online')
    ipfs.isOnline((err, isOnline) => {
      if (err) throw err
      setStatus(isOnline)
      if (isOnline) {
        $goOffline.disabled = false
        ipfs.peers((err, peers) => {
          if (err) throw err
          setNumberOfPeers(peers.length)
          setPeers(peers)
        })
      } else {
        $goOnline.disabled = false
      }
    })
  })
}
updateStatus()

const changeDaemonState = (goOnline) => {
  if (goOnline) {
    $goOnline.disabled = true
    $goOffline.disabled = true
    ipfs.goOnline(() => {
      $goOffline.disabled = false
      updateStatus()
    })
  } else {
    $goOnline.disabled = true
    $goOffline.disabled = true
    ipfs.goOffline(() => {
      $goOnline.disabled = false
      updateStatus()
    })
  }
}
$goOnline.addEventListener('click', () => {
  changeDaemonState(true)
})
$goOffline.addEventListener('click', () => {
  changeDaemonState(false)
})
