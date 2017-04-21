const handler = require("./index").handler



jest.mock('aws-sdk', () => (require("../mocks").AWS))


const context = { }

describe("handler", () => {
  // beforeEach(() => {
  //   mockStorage.clear()
  // })

  describe("id", () => {
    it("should return a new id if the event doesn't have one", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.id).toBeDefined()
          done()
      })
    })
    it("should return a unique id", (done) => {
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
    it("should return the same id if the event already has one", (done) => {
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
    it("should return an empty group array if the event doesn't have one and there is no id", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.group).toEqual([])
          done()
      })
    })
    it("should add any additional members requested to the group", (done) => {
      handler({ group: [ "Jim" ] }, context, (err, state) => {
          expect(state.group[0].name).toBe("Jim")
          done()
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
    it("should return an empty list array if one isn't present", (done) => {
      handler({ }, context, (err, state) => {
          expect(state.list).toEqual([])
          done()
      })
    })
  })
})
