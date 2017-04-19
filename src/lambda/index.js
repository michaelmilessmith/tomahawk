const shortid = require('shortid');

exports.handler = function(event, context, callback) {
  if(!event.id) {
    const id = shortid.generate()
    callback(null, { id })
  } else {
    callback(null, { id: event.id })
  }
  //See what type of event

  //Get current state

  //return current state
}
