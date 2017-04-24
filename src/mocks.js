
const mockStorage = new Map()

//functions are not accurate representation but work for my needs
function DocumentClient() {
  const initTable = (tableName) =>{
    if(!mockStorage.has(tableName)){
      mockStorage.set(tableName, new Map())
    }
  }
  this.put = (params, callback) => {
    initTable(params.TableName)
    mockStorage.get(params.TableName).set(params.Item.id, params.Item)
    callback(null, {})
  }
  this.get = (params, callback) => {

    initTable(params.TableName)
    const item = mockStorage.get(params.TableName).get(params.Key.id)
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
