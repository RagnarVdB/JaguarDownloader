const tmp = require('tmp')

const tmpobj = tmp.dirSync({unsafeCleanup: true})
console.log(tmpobj.name)

setTimeout(() => tmpobj.removeCallback(), 30000)
