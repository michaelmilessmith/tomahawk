
const mockStorage = new Map()

//functions are not accurate representation but work for my needs
function DocumentClient() {
  this.put = (params, callback) => {
    mockStorage.set(params.Item.id, params.Item)
    callback(null, {})
  }
  this.get = (params, callback) => {
    const item = mockStorage.get(params.Key.id)
    if(item){
      callback(null, { Item: item })
    }
    callback(null, { })
  }
}

module.exports.AWS = {
  mockStorage,
  DynamoDB:{
    DocumentClient: DocumentClient
  }
}
