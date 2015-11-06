import { expect } from 'chai';
import Adaptor from '../src/adaptor';

describe("Adaptor", () => {

  describe("constructor", () => {
    it("sets the credentials", () => {
      let adaptor = new Adaptor({username: "openfn"})
      expect(adaptor.credentials.username).to.equal("openfn")
    })

    it("creates a jsForce connection object", () => {
      let adaptor = new Adaptor({username: "openfn"})
      expect(adaptor.connection).to.be.a('object');
    })
  })

  describe("#login", () => {
    it("performs a login", (done) => {
      let adaptor = new Adaptor({username: "openfn", password: "password"})
      adaptor.connection = {
        login: (username, password) => {
          expect(username).to.equal("openfn")
          expect(password).to.equal("password")
          return new Promise((resolve,reject) => {
            resolve(adaptor)
          })
        }

      }
      adaptor.login().then((adaptor) => {
        expect(adaptor).to.be.a('object');
        done()
      });

    })
  })

  describe("execute", () => {
    it("calls each operation", (done) => {
      new Adaptor().execute([done]);
    })
  })

})
