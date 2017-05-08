## webext-js-ipfs

> Run js-ipfs inside a WebExtension

### Running locally

* `npm install`
* `npm run build`
* Open `about:debugging` in Firefox and point it to the manifest.json in this repository
* Now try the test page: https://ipfs.io/ipfs/QmNnMpP1yJbcwREZHTPAjxFYgoNk5pGaudbHHq1t2ahDrb

### Packaging

* Sign up for AMO https://addons.mozilla.org/
* Run `npm run package`
* Upload the resulting zip to AMO
* You'll get back an .xpi you can use for installing the extension

## License

MIT 2017 - Victor Bjelkholm
