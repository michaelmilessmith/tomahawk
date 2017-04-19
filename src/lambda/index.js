const shortid = require('shortid');

exports.handler = function(event, context, callback) {
  const response = {}

  //id
  if(event.id && context.storage.has(event.id)) {
    Object.assign(response, context.storage.get(event.id))
  } else {
    response.id = shortid.generate()
  }

  //group
  response.group = []
  if(event.group) {
    response.group = response.group.concat(event.group.map((item) => {
        return { name: item, id: shortid.generate() }
    }))
  }

  //list

  // console.log(response)
  context.storage.set(response.id, response)
  callback(null, response)
  //See what type of event

  //Get current state

  //return current state
}
