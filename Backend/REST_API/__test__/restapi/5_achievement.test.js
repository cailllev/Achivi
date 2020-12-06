const should = require('chai').should();

const apiTest = require('./test_utilities')
const user = apiTest.user0;
const friend = apiTest.user1;
const stranger = apiTest.user2;
const groupName = apiTest.groupName;

let own_achievement_id;

describe("Achievement - User Creation", async () => {
    it("register users", async () => {
        (await apiTest.register(user)).status.should.equal(true);
        (await apiTest.register(friend)).status.should.equal(true);
        (await apiTest.register(stranger)).status.should.equal(true);
    })
});

describe("Achievement - Claim & Declaim", async () => {
    it("user claims achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.claimAchievement(user.profileName, 1)).status.should.equal(true);
    });

    it("get claimed achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);

        const res = (await apiTest.getClaimedAchievements(user.profileName));
        res.length.should.equal(1);
        res[0].id.should.equal("1");
    });

    it("user declaims achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.declaimAchievement(user.profileName, 1)).status.should.equal(true);
    });

    it("get claimed achievement (empty)", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.getClaimedAchievements(user.profileName)).length.should.equal(0);
    });
});

describe("Achievement - Flag & Deflag", async () => {
    it("user flaggs achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.flagAchievement(user.profileName, 1)).status.should.equal(true);
    });

    it("get flagged achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);

        const res = (await apiTest.getFlaggedAchievements(user.profileName));
        res.length.should.equal(1);
        res[0].id.should.equal("1");
    });

    it("user deflaggs achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.deflagAchievement(user.profileName, 1)).status.should.equal(true);
    });

    it("get flagged achievement (empty)", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.getFlaggedAchievements(user.profileName)).length.should.equal(0);
    });
});

describe("Achievement Group - Group Creation", async () => {
    it("create group", async ()  => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.createGroup(groupName, JSON.stringify([]))).status.should.equal(true);
    });
});

describe("Achievement Group - Create & Delete Achievement", async () => {
    it("create new achievement", async ()  => {
        (await apiTest.login(user)).status.should.equal(true);

        const res = (await apiTest.createAchievement());
        res.status.should.equal(true);
        own_achievement_id = res.id;
    });

    it("get all group achievements", async ()  => {
        (await apiTest.login(user)).status.should.equal(true);

        const res = (await apiTest.getGroupAchievements(groupName));
        const achievements = res.message;
        res.status.should.equal(true);
        achievements[0].id.should.equal(own_achievement_id.toString());
    });

    it("user claims new achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.claimAchievement(user.profileName, own_achievement_id)).status.should.equal(true);
    });

    it("get achievement points of own profile", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.getPoints(user.profileName)).should.equal("20");
    });

    it("user follows friend", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.follow(user.profileName, friend.profileName)).status.should.equal(true);
    });

    it("friend follows user", async () => {
        (await apiTest.login(friend)).status.should.equal(true);
        (await apiTest.follow(friend.profileName, user.profileName)).status.should.equal(true);
    });

    it("user and friend are now friends", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.getFriends(user.profileName)).friend[0].profile_name.should.equal(friend.profileName);
    });

    it("get achievement points as friends", async () => {
        (await apiTest.login(friend)).status.should.equal(true);
        (await apiTest.getPoints(user.profileName)).should.equal("20");
    });

    it("get achievement points as strangers", async () => {
        (await apiTest.login(stranger)).status.should.equal(true);
        try {
            (await apiTest.getPoints(user.profileName)).status.should.equal(true);
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(403);
            message.should.equal(`Cannot get points for stranger profile ${user.profileName}`);
        }
    });

    it("delete achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.deleteAchievement(own_achievement_id.toString())).status.should.equal(true);
    });

    it("delete same achievement", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        try {
            (await apiTest.deleteAchievement(own_achievement_id.toString()));
        } catch (e) {
            const statusCode = e.response.status;
            const message = e.response.data;

            statusCode.should.equal(412);
            message.should.equal(`No group for achievement with id ${own_achievement_id} found`);
        }
    });
});

describe("Achievement Group -  Group & User Deletion", async () => {
    it("delete group", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.deleteGroup(groupName)).status.should.equal(true);
    });

    it("delete user", async () => {
        (await apiTest.login(user)).status.should.equal(true);
        (await apiTest.deleteUser(user)).status.should.equal(true);
    });

    it("delete friend", async () => {
        (await apiTest.login(friend)).status.should.equal(true);
        (await apiTest.deleteUser(friend)).status.should.equal(true);
    });

    it("delete stranger", async () => {
        (await apiTest.login(stranger)).status.should.equal(true);
        (await apiTest.deleteUser(stranger)).status.should.equal(true);
    });
});