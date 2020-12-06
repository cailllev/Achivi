const should = require('chai').should();

const apiTest = require('./test_utilities');
const user0 = apiTest.user0;
const user1 = apiTest.user1;
const user2 = apiTest.user2;

describe("Profile - Setup", () => {
    it("register users", async () => {
        (await apiTest.register(user0)).status.should.equal(true);
        (await apiTest.register(user1)).status.should.equal(true);
    });
});

describe("Profile - Methods", () => {
    it("get own profile", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getOwnProfile()).profile_name.should.equal(user0.profileName);
    });

    it("get profile", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.getProfile(user1.profileName)).profile_name.should.equal(user1.profileName);
    });

    it("update profile", async () => {
        const new_bio = "Finally a new bio"
        user0.bio = new_bio;
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.updateProfile(user0)).bio.should.equal(new_bio);
    });

    it("check name used", async () => {
        (await apiTest.checkName(user0.profileName)).status.should.equal(true);
        (await apiTest.checkName(user2.profileName)).status.should.equal(false);
    });

    it("search profile", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.searchProfile(user1.profileName)).message[0].name.should.equal(user1.profileName);
    });
});

describe("Profile - Deletion", () => {
    it("delete user0", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.deleteUser(user0)).status.should.equal(true);
    });

    it("delete user1", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.deleteUser(user1)).status.should.equal(true);
    });
});