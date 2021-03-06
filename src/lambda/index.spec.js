const handler = require("./index").handler
const jdp = require("jsondiffpatch")

jest.mock('aws-sdk', () => (require("../mocks").AWS))

const AWS = require("aws-sdk")
const context = { }

const helper = (state, actions, callback) => {
  const request = {}
  request.id = state.id || undefined
  request.actions = actions || undefined
  request.version = state.version || undefined
  handler(request, context, (err, delta) => {
    const send = Object.assign({}, state)
    jdp.patch(send, delta)
    callback(err, send)
  })
}

const helperNoAction =  (state, callback) => {
  helper(state, undefined, callback)
}

describe("handler", () => {
  beforeEach(() => {
    AWS.mockStorage.clear()
    jest.resetAllMocks()
  })

  describe("id", () => {
    it("should return a new id if one isn't provided", (done) => {
      helperNoAction({}, (err, state) => {
          expect(state.id).toBeDefined()
          done()
      })
    })
    it("should be unique", (done) => {
      const ids = []
      helperNoAction({}, (err, state) => {
        ids.push(state.id)
        helperNoAction({ }, (err, state) => {
          ids.push(state.id)
          expect(ids[0]).not.toBe(ids[1])
          done()
        })
      })
    })
    it("should return the same id that is provided", (done) => {
      helperNoAction({}, (err, state) => {
        const id = state.id
        helperNoAction(state, (err, state) => {
          expect(state.id).toBe(id)
          done()
        })
      })
    })
  })
  describe("name actions", () => {
    const changeName = (name) => ({
      type: "CHANGE_NAME",
      payload: {
        name
      }
    })
    it("Should include a name provided", (done) => {
      helper({ }, [changeName("My List")], (err, state) => {
          expect(state.name).toBe("My List")
          done()
      })
    })
    it("Should include an empty string for name if it is not provided", (done) => {
      helperNoAction({ }, (err, state) => {
          expect(state.name).toBe("")
          done()
      })
    })
    it("Should overwrite the name if a new one is provided", (done) => {
      helper({ }, [changeName("My List")], (err, state) => {
        helper(state, [changeName("Other List")], (err, state) => {
          expect(state.name).toBe("Other List")
          done()
        })
      })
    })
    it("Should return the name previously provided on later calls", (done) => {
      helper({ }, [changeName("My List")], (err, state) => {
        helperNoAction(state, (err, state) => {
          expect(state.name).toBe("My List")
          done()
        })
      })
    })
  })
  describe("group", () => {
    const addGroupMember = (name) => ({
      type: "ADD_GROUP_MEMBER",
      payload: {
        name
      }
    })
    it("should return an empty group if there is no group and id provided", (done) => {
      helperNoAction({}, (err, state) => {
        expect(state.group).toEqual(new Map())
        done()
      })
    })
    it("should add any additional members provided to the group", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
          const groupIter = state.group.values();
          expect(groupIter.next().value.name).toBe("Jim")
          done()
      })
    })
    it("should return the group containing any members previously added", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
        helper(state, [addGroupMember("James")], (err, state) => {
          const groupIter = state.group.values();
          expect(groupIter.next().value.name).toBe("Jim" )
          expect(groupIter.next().value.name).toBe("James")
          done()
        })
      })
    })
    it("should add any additional members with a unique id", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
        helper(state, [addGroupMember("Jim")], (err, state) => {
          const keys = state.group.keys();
          expect(keys.next().value).not.toBe(keys.next().value)
          done()
        })
      })
    })
  })
  describe("list", () => {
    const addGroupMember = (name) => ({
      type: "ADD_GROUP_MEMBER",
      payload: {
        name
      }
    })
    const addItem = (name, cost, memberId) => ({
      type: "ADD_ITEM",
      payload: {
        name,
        cost,
        memberId
      }
    })
    it("should return an empty list if one isn't present", (done) => {
      helperNoAction({}, (err, state) => {
          expect(state.list).toEqual([])
          done()
      })
    })
    it("should not allow entries to be added to the list without a group member id", (done) => {
      helper({}, [addGroupMember("Jim"), addItem("Thing", 5.00)], (err, state) => {
        expect(state.list).toEqual([])
        done()
      })
    })
    it("should add any additional items provided to the list", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
        const memberId = state.group.keys().next().value
        helper(state, [addItem("Thing",5.00, memberId)], (err, state) => {
          expect(state.list[0].name).toBe("Thing")
          expect(state.list[0].cost).toBe(5.00)
          done()
        })
      })
    })
    it("should return the list containing any items previously added", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
        const memberId = state.group.keys().next().value
        helper(state, [addItem("Thing",5.00, memberId)], (err, state) => {
          helper(state, [addItem("OtherThing",10.00, memberId)], (err, state) => {
            expect(state.list[0].name).toBe("Thing")
            expect(state.list[0].cost).toBe(5.00)
            expect(state.list[1].name).toBe("OtherThing")
            expect(state.list[1].cost).toBe(10.00)
            done()
          })
        })
      })
    })
    it("should add any additional items with a unique id", (done) => {
      helper({}, [addGroupMember("Jim")], (err, state) => {
        const memberId = state.group.keys().next().value
        helper(state, [addItem("Thing",5.00, memberId)], (err, state) => {
          helper(state, [addItem("OtherThing",10.00, memberId)], (err, state) => {
            expect(state.list[0].id).not.toBe(state.list[1].id)
            done()
          })
        })
      })
    })
  })
})
