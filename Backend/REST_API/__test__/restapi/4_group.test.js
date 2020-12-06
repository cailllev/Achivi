const should = require('chai').should();

const apiTest = require('./test_utilities');
const user0 = apiTest.user0;
const user1 = apiTest.user1;
const user2 = apiTest.user2;
const user3 = apiTest.user3;
const groupName = apiTest.groupName;

describe("Group - Creation", async () => {
    it("register users", async () => {
        (await apiTest.register(user0)).status.should.equal(true);
        (await apiTest.register(user1)).status.should.equal(true);
        (await apiTest.register(user2)).status.should.equal(true);
        (await apiTest.register(user3)).status.should.equal(true);
    });

    it("create group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.createGroup(groupName, "[]")).status.should.equal(true);
    });
});

describe("Group - Add Members", async () => {
    it("user1 cannot be added to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);

        const res = (await apiTest.addMembers(groupName, JSON.stringify([user1.profileName])));
        res.status.should.equal(false);
        res.usersForbiddenToAdd[0].should.equal(user1.profileName);
    });

    it("user1 follows user0", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.follow(user1.profileName, user0.profileName)).status.should.equal(true);
    });

    it("add user1 to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.addMembers(groupName, JSON.stringify([user1.profileName]))).status.should.equal(true);
    });

    it("user2 cannot be added to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);

        const res = (await apiTest.addMembers(groupName, JSON.stringify([user2.profileName])));
        res.status.should.equal(false);
        res.usersForbiddenToAdd[0].should.equal(user2.profileName);
    });

    it("user2 follows user1", async () => {
        (await apiTest.login(user2)).status.should.equal(true);
        (await apiTest.follow(user2.profileName, user1.profileName)).status.should.equal(true);
    });

    it("add user2 to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.addMembers(groupName, JSON.stringify([user2.profileName]))).status.should.equal(true);
    });

    it("user3 cannot be added to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);

        const res = (await apiTest.addMembers(groupName, JSON.stringify([user3.profileName])));
        res.status.should.equal(false);
        res.usersForbiddenToAdd[0].should.equal(user3.profileName);
    });

    it("user3 follows user2", async () => {
        (await apiTest.login(user3)).status.should.equal(true);
        (await apiTest.follow(user3.profileName, user2.profileName)).status.should.equal(true);
    });

    it("user3 still cannot be added to group", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);

        const res = (await apiTest.addMembers(groupName, JSON.stringify([user3.profileName])));
        res.status.should.equal(false);
        res.usersForbiddenToAdd[0].should.equal(user3.profileName);
    });
});

describe("Group - Remove Members", async () => {
    it("user1 cannot remove user2", async ()  => {
        (await apiTest.login(user1)).status.should.equal(true);
        try {
            (await apiTest.removeMember(groupName, user2.profileName));
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal("Only an admin can remove other members");
        }
    });

    it("admin cannot remove himself", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        try {
            (await apiTest.removeMember(groupName, user0.profileName));
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal("The admin cannot be removed, give admin to someone else first");
        }
    });

    it("user2 removes himself", async ()  => {
        (await apiTest.login(user2)).status.should.equal(true);
        (await apiTest.removeMember(groupName, user2.profileName)).status.should.equal(true);
    });
});

describe("Group - Change Admin", async () => {
    it("user1 cannot give admin to himself", async ()  => {
        (await apiTest.login(user1)).status.should.equal(true);
        try {
            (await apiTest.changeAdmin(groupName, user1.profileName));
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal("Only an admin can assign the new admin");
        }
    });

    it("user0 cannot give admin to user2", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        try {
            (await apiTest.changeAdmin(groupName, user2.profileName));
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal(`User ${user2.profileName} is not in group ${groupName}. Add them to group before setting them to admin`);
        }
    });

    it("user0 gives admin to user1", async ()  => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.changeAdmin(groupName, user1.profileName)).status.should.equal(true);
    });

    it("user1 gives admin back to user0", async ()  => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.changeAdmin(groupName, user0.profileName)).status.should.equal(true);
    });
});

describe("Group - Deletion", async () => {
    it("only admin can delete group", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        try {
            (await apiTest.deleteGroup(groupName)).status.should.equal(true);
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal("Only an admin can delete their group");
        }
    });

    it("delete group", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.deleteGroup(groupName)).status.should.equal(true);
    });

    it("delete user0", async () => {
        (await apiTest.login(user0)).status.should.equal(true);
        (await apiTest.deleteUser(user0)).status.should.equal(true);
    });

    it("delete user1", async () => {
        (await apiTest.login(user1)).status.should.equal(true);
        (await apiTest.deleteUser(user1)).status.should.equal(true);
    });

    it("delete user2", async () => {
        (await apiTest.login(user2)).status.should.equal(true);
        (await apiTest.deleteUser(user2)).status.should.equal(true);
    });

    it("delete user3", async () => {
        (await apiTest.login(user3)).status.should.equal(true);
        (await apiTest.deleteUser(user3)).status.should.equal(true);
    });
});