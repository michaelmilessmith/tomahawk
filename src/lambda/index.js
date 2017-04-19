const shortid = require('shortid');

exports.handler = function(event, context, callback) {
  const response = {}
  if(!event.id) {
    response.id = shortid.generate()
  } else {
    response.id = event.id
  }
  response.group = []
  if(event.group) {
    response.group = response.group.concat(event.group.map((item) => {
        return { name: item }
    }))
    console.log(response)
  }
  callback(null, response)
  //See what type of event

  //Get current state

  //return current state
}
