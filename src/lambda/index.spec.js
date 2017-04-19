const handler = require("./index").handler

describe("handler", () => {
  describe("id", () => {
    it("should return a new id if the event doesn't have one", () => {
      handler({ }, null, (err, state) => {
          expect(state.id).toBeDefined()
      })
    })
    it("should return a unique id", () => {
      const ids = []
      handler({ }, null, (err, state) => {
        ids.push(state.id)
      })
      handler({ }, null, (err, state) => {
        ids.push(state.id)
      })
      expect(ids[0]).not.toBe(ids[1])
    })
    it("should return the same id if the event already has one", () => {
      const id = "ABCDE"
      handler({ id }, null, (err, state) => {
          expect(state.id).toBe(id)
      })
    })
  })
})
