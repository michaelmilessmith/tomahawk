const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()
const shortid = require('shortid');
const jdp = require("jsondiffpatch")

const reducer = function(state, action){
  const { payload } = action
  switch(action.type){
    case "ADD_GROUP_MEMBER":
      const id = shortid.generate()
      state.group.set(id, { id, name: payload.name })
      return Object.assign({}, state, {
        group: new Map([...state.group])
      })
    case "CHANGE_NAME":
      return Object.assign({}, state, { name: payload.name })
    case "ADD_ITEM":
      if(state.group.has(payload.memberId)){
        return Object.assign({}, state, {
          list: state.list.concat([Object.assign({}, payload, { id: shortid.generate() })])
        })
      }
  }
  return state
}

const innerReply = (response, item, callback) => {
  const putParams = {
    TableName: "CurrentLists",
    Item: item
  }
  const putOldParams = {
    TableName: "OldLists",
    Item: Object.assign({}, item, { id: item.version })
  }
  docClient.put(putParams, (err, data) => {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      docClient.put(putOldParams, (err, data) => {
        if (err) {
          console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          callback(null, response)
        }
      })
    }
  })
}

const reply = (previous, current, actions, callback) => {
  const newVersion = shortid.generate()
  if(actions){
    const latest = actions.reduce(reducer, current)
    const newItem = Object.assign(latest, { version: newVersion })
    const delta = jdp.diff(previous, newItem)
    innerReply(delta, newItem, callback)
  } else {
    const newItem = Object.assign(current, { version: newVersion })
    const delta = jdp.diff(previous, newItem)
    innerReply(delta, newItem, callback)
    //callback(null, delta)
  }
}

const init = () => ({
  id: shortid.generate(),
  version: shortid.generate(),
  name: "",
  group: new Map(),
  list: []
})

//ToDo
// - error handling callbacks
// - update functionality
// - delete functionality
// - improve data structure
// - more production features, cloudwatch, aws params
exports.handler = function(event, context, callback) {
  const { id, actions, version } = event

  if(id) {
    const getCurrentParams = {
      TableName: "CurrentLists",
      Key: { id }
    }
    docClient.get(getCurrentParams, (err, data) => {
      if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        if(data.Item) {
          const current = Object.assign({}, data.Item)

          if(version) {
            const getOldParams = {
              TableName: "OldLists",
              Key: { id: version }
            }
            docClient.get(getOldParams, (err, data) => {
              if (err) {
                  console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
              } else {
                reply(data.Item, current, actions, callback)
              }
            })
          } else {
            reply({}, current, actions, callback)
          }
        } else {
          reply({}, init(), actions, callback)
        }
      }
    })
  } else {
    reply({}, init(), actions, callback)
  }
}
