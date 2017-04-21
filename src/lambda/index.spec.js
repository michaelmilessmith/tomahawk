const handler = require("./index").handler

jest.mock('aws-sdk', () => (require("../mocks").AWS))

const context = { }

describe("handler", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe("id", () => {
    it("should return a new id if one isn't provided", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.id).toBeDefined()
          done()
      })
    })
    it("should be unique", (done) => {
      const ids = []
      const callback = (err, state) => {
        ids.push(state.id)
        handler({ }, context, (err, state) => {
          ids.push(state.id)
          expect(ids[0]).not.toBe(ids[1])
          done()
        })
      }
      handler({ }, context, callback)
    })
    it("should return the same id that is provided", (done) => {
      let id = ''
      handler({ }, context, (err, state) => {
          id = state.id
          handler({ id }, context, (err, state) => {
              expect(state.id).toBe(id)
              done()
          })
      })
    })
  })
  describe("group", () => {
    it("should return an empty group if there is no group and id provided", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.group).toEqual([])
          done()
      })
    })
    it("should add any additional members provided to the group", (done) => {
      handler({ group: [ "Jim" ] }, context, (err, state) => {
          expect(state.group[0].name).toBe("Jim")
          done()
      })
    })
    it("should return the group containing any members previously added", (done) => {
      handler({ group: [ "Jim" ] }, context, (err, state) => {
        handler({ id: state.id, group: [ "James" ] }, context, (err, state) => {
          expect(state.group[0].name).toBe("Jim" )
          expect(state.group[1].name).toBe("James" )
          done()
        })
      })
    })
    it("should add any additional members with a unique id", (done) => {
      handler({ group: [ "Jim" ] }, context, (err, state) => {
        handler({ id: state.id, group: [ "Jim" ] }, context, (err, state) => {
          expect(state.group[0].id).not.toBe(state.group[1].id)
          done()
        })
      })
    })
  })
  describe("list", () => {
    it("should return an empty list if one isn't present", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.list).toEqual([])
          done()
      })
    })
    it("should add any additional members provided to the group", (done) => {
      handler({ list: [{ name: "Thing", cost: 5.00 }] }, context, (err, state) => {
          expect(state.list[0].name).toBe("Thing")
          expect(state.list[0].cost).toBe(5.00)
          done()
      })
    })
    it("should return the group containing any members previously added", (done) => {
      handler({ list: [{ name: "Thing", cost: 5.00 }] }, context, (err, state) => {
        handler({ id: state.id, list: [{ name: "OtherThing", cost: 10.00 }] }, context, (err, state) => {
          expect(state.list[0].name).toBe("Thing")
          expect(state.list[0].cost).toBe(5.00)
          expect(state.list[1].name).toBe("OtherThing")
          expect(state.list[1].cost).toBe(10.00)
          done()
        })
      })
    })
    it("should add any additional members with a unique id", (done) => {
      handler({ list: [{ name: "Thing", cost: 5.00 }] }, context, (err, state) => {
        handler({ id: state.id, list: [{ name: "OtherThing", cost: 10.00 }] }, context, (err, state) => {
          expect(state.list[0].id).not.toBe(state.list[1].id)
          done()
        })
      })
    })
  })
})
