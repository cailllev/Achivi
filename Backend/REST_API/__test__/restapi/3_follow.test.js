const should = require('chai').should();

const apiTest = require('./test_utilities')
const user0 = apiTest.user0;
const user1 = apiTest.user1;

describe("Follow - User Setup", async () => {
    it("register users", async () => {
        (await apiTest.register(user0)).status.should.equal(true);
        (await apiTest.register(user1)).status.should.equal(true);
    })
});

describe("Follow - Follow & Friends", async () => {
    it("user0 follows user1", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.follow(user0.profileName, user1.profileName)).status.should.equal(true);
    })

    it("user0 and user1 are not yet friends", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getFriends(user0.profileName)).friend.length.should.equal(0);
    })

    it("user1 follows user0", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.follow(user1.profileName, user0.profileName)).status.should.equal(true);
    })

    it("user0 and user1 are now friends", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getFriends(user0.profileName)).friend[0].profile_name.should.equal(user1.profileName);
    })
});

describe("Follow - Unfollow & Friends", async () => {
    it("user0 and user1 are still friends", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getFriends(user0.profileName)).friend[0].profile_name.should.equal(user1.profileName);
    })

    it("user1 unfollows user0", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.unfollow(user1.profileName, user0.profileName)).status.should.equal(true);
    })

    it("user0 and user1 are no more friends", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getFriends(user0.profileName)).friend.length.should.equal(0);
    })

    it("user0 unfollows user1", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.unfollow(user0.profileName, user1.profileName)).status.should.equal(true);
    })
});

describe("Follow - User Deletion", async () => {
    it("delete user0", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.deleteUser(user0)).status.should.equal(true);
    })

    it("delete user1", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.deleteUser(user1)).status.should.equal(true);
    })
});