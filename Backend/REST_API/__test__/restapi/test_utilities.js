const url = 'http://160.85.252.106'

const axios = require('axios');

//-------------------- AXIOS CONFIG --------------------//
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

axios.defaults.withCredentials = true;
axios.defaults.jar = cookieJar;
axios.defaults.timeout = 10000; //(10s)

console.log("\nStarting restapi tests");
console.log("Timeout set to: 10s");


const apiTest = Object.create(null);


//------------------------------- DATA -------------------------------//
apiTest.user0 = {
    email: "user0@test.ch",
    password: "0123456789",
    profileName: "mocha_test0",
    birthDate: "01.01.2000",
    firstName: "Mocha",
    lastName: "Test",
    picture: "null",
    bio: "Am I really just a test?"
}

apiTest.user1 = {
    email: "user1@test.ch",
    password: "0123456789",
    profileName: "mocha_test1",
    birthDate: "01.01.2000",
    firstName: "Mocha",
    lastName: "Test",
    picture: "null",
    bio: "Am I really just a test?"
}

apiTest.user2 = {
    email: "user2@test.ch",
    password: "0123456789",
    profileName: "mocha_test2",
    birthDate: "01.01.2000",
    firstName: "Mocha",
    lastName: "Test",
    picture: "null",
    bio: "Am I really just a test?"
}

apiTest.user3 = {
    email: "user3@test.ch",
    password: "0123456789",
    profileName: "mocha_test3",
    birthDate: "01.01.2000",
    firstName: "Mocha",
    lastName: "Test",
    picture: "null",
    bio: "Am I really just a test?"
}

apiTest.groupName = "test_group";

apiTest.achievement = {
    name: "test_achievement",
    description: "Only for testing, good luck claiming this",
    achClName: "Gold",
    groupName: apiTest.groupName
}

//------------------------------- USER METHODS -------------------------------//
apiTest.register = async (user) => {
    const res = await axios.post(url + '/api/register',{
        email: user.email,
        password: user.password,
        profileName: user.profileName,
        birthDate: user.birthDate,
        firstName: user.firstName,
        lastName: user.lastName
    });
    return res.data;
}

apiTest.login = async (user) => {
    const res = await axios.post(url + '/api/login',{
        email: user.email,
        password: user.password
    })
    return res.data;
}

apiTest.logout = async (user) => {
    const res = await axios.delete(url + '/api/logout/' + user.profileName);
    return res.data;
}

apiTest.deleteUser = async (user) => {
    const res = await axios.delete(url + '/api/users/' + user.email);
    return res.data;
}


//------------------------------- PROFILE METHODS -------------------------------//
apiTest.getOwnProfile = async () => {
    const res = await axios.get(url + `/api/profiles`)
    return res.data;
}

apiTest.getProfile = async (profileName) => {
    const res = await axios.get(url + `/api/profiles/${profileName}`)
    return res.data;
}

apiTest.updateProfile = async (user) => {
    const res = await axios.put(url + `/api/profiles/${user.profileName}`, user)
    return res.data;
}

apiTest.checkName = async (profileName) => {
    const res = await axios.get(url + `/api/profiles/${profileName}/is-used`)
    return res.data;
}

apiTest.searchProfile = async (profileNameLike) => {
    const res = await axios.get(url + `/api/profiles?q=${profileNameLike}`)
    return res.data;
}


//------------------------------- FOLLOW METHODS -------------------------------//
apiTest.follow = async (ownProfileName, followProfileName) => {
    const res = await axios.post(url + `/api/profiles/${ownProfileName}/followees`,{
        followeeProfileName: followProfileName
    })
    return res.data;
}

apiTest.unfollow = async (ownProfileName, unfollowProfileName) => {
    const res = await axios.delete(url + `/api/profiles/${ownProfileName}/followees/${unfollowProfileName}`);
    return res.data;
}

apiTest.getFriends = async (ownProfileName) => {
    const res = await axios.get(url + `/api/profiles/${ownProfileName}/friends`);
    return res.data;
}


//------------------------------- GROUP METHODS -------------------------------//
apiTest.createGroup = async (groupName, members) => {
    const res = await axios.post(url + '/api/groups',{
        groupName: groupName,
        members: members
    });
    return res.data;
}

apiTest.addMembers = async (groupName, membersToAdd) => {
    const res = await axios.post(url + `/api/groups/${groupName}/members`,{
        users: membersToAdd
    });
    return res.data;
}

apiTest.removeMember = async (groupName, memberToBeRemoved) => {
    const res = await axios.delete(url + `/api/groups/${groupName}/members/${memberToBeRemoved}`);
    return res.data;
}

apiTest.changeAdmin = async (groupName, newAdmin) => {
    const res = await axios.put(url + `/api/groups/${groupName}/change-admin/${newAdmin}`);
    return res.data;
}

apiTest.deleteGroup = async (groupName) => {
    const res = await axios.delete(url + '/api/groups/' + groupName);
    return res.data;
}


//------------------------------- ACHIEVEMENT METHODS -------------------------------//
apiTest.getPoints = async (profileName) => {
    const res = await axios.get(url + `/api/profiles/${profileName}/achievements/points`);
    return res.data;
}

apiTest.claimAchievement = async (profileName, achievementID) => {
    const res = await axios.post(url + `/api/profiles/${profileName}/achievements/${achievementID}/claim`);
    return res.data;
}

apiTest.declaimAchievement = async (profileName, achievementID) => {
    const res = await axios.delete(url + `/api/profiles/${profileName}/achievements/${achievementID}/claim`);
    return res.data;
}

apiTest.flagAchievement = async (profileName, achievementID) => {
    const res = await axios.post(url + `/api/profiles/${profileName}/achievements/${achievementID}/flag`);
    return res.data;
}

apiTest.deflagAchievement = async (profileName, achievementID) => {
    const res = await axios.delete(url + `/api/profiles/${profileName}/achievements/${achievementID}/flag`);
    return res.data;
}

apiTest.getGroupAchievements = async (groupName) => {
    const res = await axios.get(url + `/api/groups/${groupName}/achievements`);
    return res.data;
}

apiTest.getCategoryAchievements = async (categoryName) => {
    const res = await axios.get(url + `/api/achievements/categories/${categoryName}`);
    return res.data;
}

apiTest.getAchievement = async (id) => {
    const res = await axios.get(url + `/api/achievements/${id}`);
    return res.data;
}

apiTest.getClaimedAchievements = async (profileName) => {
    const res = await axios.get(url + `/api/profiles/${profileName}/achievements/claimed`);
    return res.data;
}

apiTest.getFlaggedAchievements = async (profileName) => {
    const res = await axios.get(url + `/api/profiles/${profileName}/achievements/flagged`);
    return res.data;
}

apiTest.createAchievement = async () => {
    const res = await axios.post(url + `/api/achievements`, apiTest.achievement);
    return res.data;
}

apiTest.deleteAchievement = async (id) => {
    const res = await axios.delete(url + `/api/achievements/${id}`);
    return res.data;
}


/**
 * exports
 */
module.exports = {
    server: apiTest.server,
    user0: apiTest.user0,
    user1: apiTest.user1,
    user2: apiTest.user2,
    user3: apiTest.user3,
    groupName: apiTest.groupName,

    //user
    register: (user) => {
        return apiTest.register(user);
    },
    login: (user) => {
        return apiTest.login(user);
    },
    logout: (user) => {
        return apiTest.logout(user);
    },
    deleteUser: (user) => {
        return apiTest.deleteUser(user);
    },

    //profile
    getOwnProfile: () => {
        return apiTest.getOwnProfile();
    },
    getProfile: (profileName) => {
        return apiTest.getProfile(profileName);
    },
    updateProfile: (user) => {
        return apiTest.updateProfile(user);
    },
    checkName: (profileName) => {
        return apiTest.checkName(profileName);
    },
    searchProfile: (profileNameLike) => {
        return apiTest.searchProfile(profileNameLike);
    },

    //follow
    follow: (ownProfileName, followProfileName) => {
        return apiTest.follow(ownProfileName, followProfileName);
    },
    unfollow: (ownProfileName, unfollowProfileName) => {
        return apiTest.unfollow(ownProfileName, unfollowProfileName);
    },
    getFriends: (ownProfileName) => {
        return apiTest.getFriends(ownProfileName);
    },

    //group
    createGroup: (groupName, members) => {
        return apiTest.createGroup(groupName, members);
    },
    addMembers: (groupName, membersToAdd) => {
        return apiTest.addMembers(groupName, membersToAdd);
    },
    removeMember: (groupName, memberToBeRemoved) => {
        return apiTest.removeMember(groupName, memberToBeRemoved);
    },
    changeAdmin: (groupName, newAdmin) => {
        return apiTest.changeAdmin(groupName, newAdmin);
    },
    deleteGroup: (groupName) => {
        return apiTest.deleteGroup(groupName);
    },

    //achievement
    getPoints: (profileName) => {
        return apiTest.getPoints(profileName);
    },
    claimAchievement: (profileName, achievementID) => {
        return apiTest.claimAchievement(profileName, achievementID);
    },
    declaimAchievement: (profileName, achievementID) => {
        return apiTest.declaimAchievement(profileName, achievementID);
    },
    flagAchievement: (profileName, achievementID) => {
        return apiTest.flagAchievement(profileName, achievementID);
    },
    deflagAchievement: (profileName, achievementID) => {
        return apiTest.deflagAchievement(profileName, achievementID);
    },
    getGroupAchievements: (groupName) => {
        return apiTest.getGroupAchievements(groupName);
    },
    getCategoryAchievements: (categoryName) => {
        return apiTest.getCategoryAchievements(categoryName);
    },
    getAchievement: (id) => {
        return apiTest.getAchievement(id);
    },
    getClaimedAchievements: (profileName) => {
        return apiTest.getClaimedAchievements(profileName);
    },
    getFlaggedAchievements: (profileName) => {
        return apiTest.getFlaggedAchievements(profileName);
    },
    createAchievement: () => {
        return apiTest.createAchievement();
    },
    deleteAchievement: (id) => {
        return apiTest.deleteAchievement(id);
    }
}