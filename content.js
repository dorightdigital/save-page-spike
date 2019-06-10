const handleStateChange = x => undefined

function sendToServer(input) {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
  xhr.open("POST", 'http://localhost:9000/page-data', true)
  xhr.setRequestHeader('content-type', 'application/json')
  xhr.send(JSON.stringify(input))
}

function getFromUrl(url) {
  return new Promise((res, rej) => {
    const xhr = new XMLHttpRequest()
    const handleStateChange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          res({
            filename: url.replace(/:/g, '-').replace(/\//g, '_-_'),
            contents: xhr.responseText
          })
        } else {
          rej(new Error('Failed to load, status: ' + xhs.status))
        }
      }
    }
    xhr.onreadystatechange = handleStateChange; // Implemented elsewhere.
    xhr.open("GET", url, true)
    xhr.send()
  })
}

const forEachNode = (elementNodeListOf, iterator) => [].concat(...elementNodeListOf).forEach(iterator)
const files = {}
const promisesToWaitFor = []

const shaddow = document.documentElement.cloneNode(true)

forEachNode(shaddow.querySelectorAll('link[rel=stylesheet]'), sheet => {
  promisesToWaitFor.push(getFromUrl(sheet.getAttribute('href'))
    .then(output => {
      files[output.filename] = output.contents
      sheet.setAttribute('href', './' + output.filename)
    }))
})

Promise.all(promisesToWaitFor).then(function () {
  sendToServer({
    pageURL: window.document.location.href,
    pageHTML: shaddow.outerHTML,
    timestamp: new Date().getTime(),
    files: files
  })
})
