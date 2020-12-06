const should = require('chai').should();

const apiTest = require('./test_utilities');
const user = apiTest.user0;

describe("User - Register", () => {
    it("register", async () => {
        (await apiTest.register(user)).status.should.equal(true);
    });

    it("log in", async () => {
        (await apiTest.login(user)).status.should.equal(true);
    });
});

describe("User - Login, Logout", () => {
    it("log in", async () => {
        (await apiTest.login(user)).status.should.equal(true);
    });

    it("log out", async () => {
        (await apiTest.logout(user)).status.should.equal(true);
    });
});

describe("User - Deletion", () => {
    it("log in", async () => {
        (await apiTest.login(user)).status.should.equal(true);
    });

    it("delete user", async () => {
        (await apiTest.deleteUser(user)).status.should.equal(true);
    });
});