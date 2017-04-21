const handler = require("./index").handler
const AWS = require('aws-sdk-mock')

const mockStorage = new Map()

AWS.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
  mockStorage.set(params.Item.id, params.Item)
  callback(null, {});
});

AWS.mock('DynamoDB.DocumentClient', 'get', (params, callback) => {
  callback(null, { Item: mockStorage.get(params.Item.id));
});

const context = { }

describe("handler", () => {
  beforeEach(() => {
    mockStorage.clear()
  })

  describe("id", () => {
    it("should return a new id if the event doesn't have one", () => {
      handler({ }, context, (err, state) => {
          expect(state.id).toBeDefined()
      })
    })
    it("should return a unique id", () => {
      const ids = []
      handler({ }, context, (err, state) => {
        ids.push(state.id)
      })
      handler({ }, context, (err, state) => {
        ids.push(state.id)
      })
      expect(ids[0]).not.toBe(ids[1])
    })
    it("should return the same id if the event already has one", () => {
      let id = ''
      handler({ }, context, (err, state) => {
          id = state.id
      })
      handler({ id }, context, (err, state) => {
          expect(state.id).toBe(id)
      })
    })
  })
  describe("group", () => {
    it("should return a group array if the event doesn't have one", () => {
      handler({ }, context, (err, state) => {
          expect(state.group).toEqual([])
      })
    })
    it("should add any additional members requested to the group", () => {
      handler({ group: [ "Jim" ] }, context, (err, state) => {
          expect(state.group[0].name).toBe("Jim")
      })
    })
    it("should add any additional members with a unique id", () => {
      const ids = []
      handler({ group: [ "Jim" ] }, context, (err, state) => {
        ids.push(state.group[0].id)
      })
      handler({ group: [ "Jim" ] }, context, (err, state) => {
        ids.push(state.group[0].id)
      })
      expect(ids[0]).not.toBe(ids[1])
    })
  })
})
