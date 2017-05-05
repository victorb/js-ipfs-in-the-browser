const $id = document.querySelector('.id')
const $status = document.querySelector('.status')
const $peers = document.querySelector('.peers')
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
  isOnline: (callback) => { makeCall('isOnline', null, callback) }
}

const setID = (newID) => {
  $id.innerText = newID
}

const setStatus = (isOnline) => {
  const text = isOnline ? 'Online' : 'Offline'
  $status.innerText = text
}

const setPeers = (numberOfPeers) => {
  $peers.innerText = numberOfPeers
}

ipfs.id((err, res) => {
  if (err) throw err
  setID(res.id)
  ipfs.isOnline((err, isOnline) => {
    if (err) throw err
    setStatus(isOnline)
    ipfs.peers((err, peers) => {
      if (err) throw err
      setPeers(peers.length)
    })
  })
})
