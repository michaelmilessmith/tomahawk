const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()
const shortid = require('shortid');
const jdp = require("jsondiffpatch")

const reducer = function(state, action){
  const { payload } = action
  switch(action.type){
    case "ADD_GROUP_MEMBER":
      return Object.assign({}, state, {
        group: new Map([...state.group, [payload.id, { id: payload.id, name: payload.name }]])
      })
  }
  return state
}

const saveAndReply = (response, item, callback) => {
  const newVersion = shortid.generate()
  const putParams = {
    TableName: "CurrentLists",
    Item: Object.assign({}, item, { version: newVersion })
  }
  const putOldParams = {
    TableName: "OldLists",
    Item: Object.assign({}, item, { version: newVersion, id: newVersion })
  }
  docClient.put(putParams, (err, data) => {
    if (err) {
        console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        // console.log("Added item:", JSON.stringify(data, null, 2));
      docClient.put(putParams, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
          callback(null, response)
        }
      })
    }
  })
}

const saveAndSendDelta = (previous, current, actions, callback) => {
  if(actions){
    const latest = actions.reduce(reducer, current)
    const delta = jdp.diff(previous, latest)
    saveAndReply(delta, latest, callback)
  } else {
    const delta = jdp.diff(previous, current)
    callback(null, delta)
  }
}

const init = {
  id: shortid.generate(),
  version: shortid.generate(),
  group: new Map(),
  list: []
}

//ToDo
// - error handling callbacks
// - update functionality
// - delete functionality
// - improve data structure
// - more production features, cloudwatch, aws params
exports.handler = function(event, context, callback) {
  const { id, actions, version } = event
  //id
  if(id) {
    const getCurrentParams = {
      TableName: "CurrentLists",
      Key: { id: event.id }
    }
    docClient.get(getCurrentParams, (err, data) => {
      if (err) {
          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      } else {
        // console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        if(data.Item){
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
                saveAndSendDelta(data.Item, current, actions, callback)
              }
            })
          } else {
            saveAndSendDelta({}, current, actions, callback)
          }
        } else {
          saveAndSendDelta({}, init, actions, callback)
        }
      }
    })
  } else {
    saveAndSendDelta({}, init, actions, callback)
  }
}
