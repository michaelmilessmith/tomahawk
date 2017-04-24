const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()
const shortid = require('shortid');

exports.handler = function(event, context, callback) {
  const response = {}

  //id
  event.id = event.id || shortid.generate()

  const getParams = {
    TableName: "Lists",
    Key: { id: event.id }
  }
  docClient.get(getParams, (err, data) => {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      // console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      if(data.Item){
        Object.assign(response, data.Item)
      } else {
        response.id = event.id
      }

      //group
      response.group = response.group || new Map()
      if(event.group) {
        for(let i = 0, length = event.group.length; i < length; i++){
          const newItem = { name: event.group[i], id: shortid.generate() }
          response.group.set(newItem.id, newItem)
        }
      }

      //list
      response.list = response.list || []
      if(event.list) {
        const toAdd = event.list.filter((item) => response.group.has(item.memberId))
        response.list = response.list.concat(toAdd.map((item) => {
            return { name: item.name, id: shortid.generate(), cost: item.cost, memberId: item.memberId }
        }))
      }

      //  console.log(response)
      const putParams = {
        TableName: "Lists",
        Item: response
      }
      docClient.put(putParams, (err, data) => {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // console.log("Added item:", JSON.stringify(data, null, 2));
        }
        callback(null, response)
      })
    }
  })
}
