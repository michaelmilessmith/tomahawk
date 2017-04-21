const AWS = require("aws-sdk")
const docClient = new AWS.DynamoDB.DocumentClient()
const shortid = require('shortid');

exports.handler = function(event, context, callback) {
  const response = {}
  //id
  event.id = event.id || shortid.generate()
  if(event.id){
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
            response.id = shortid.generate()
          }

          //group
          // console.log(response)

          response.group = response.group || []
          if(event.group) {
            response.group = response.group.concat(event.group.map((item) => {
                return { name: item, id: shortid.generate() }
            }))
          }

          //list
          response.list = response.list || []
          if(event.list) {
            response.list = response.list.concat(event.list.map((item) => {
                return { name: item.name, id: shortid.generate(), cost: item.cost }
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
          //See what type of event

          //Get current state

          //return current state
      }
    })
  }
}
