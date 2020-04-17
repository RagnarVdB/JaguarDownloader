const wait = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 1000)
  })
}

wait()
  .then(() => console.log('waited 1s'))

console.log('finished script')