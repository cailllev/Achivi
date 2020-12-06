import 'package:achivi/requests/follower_request.dart';
import 'package:flutter_test/flutter_test.dart';
import '../rest_api_test_helper.dart';

Future<void> main() async {
  var _restApiTestHelper = new RESTApiTestHelper();

  setUpAll(() async {
    // Init
    await _restApiTestHelper.initState();

    // Register User A - E
    await _restApiTestHelper.userProfileA.register();
    await _restApiTestHelper.userProfileB.register();
    await _restApiTestHelper.userProfileC.register();

    // Sign in as userProfileA
    await _restApiTestHelper.userProfileA.login();
  });

  test('Try to get followers, followees, friends', () async {
    expect((await FollowerRequest.getFollowers()).length, 0,
        reason: 'Followers found');

    expect((await FollowerRequest.getFollowees()).length, 0,
        reason: 'Followers found');

    expect((await FollowerRequest.getFriends()).length, 0,
        reason: 'Followers found');
  });

  test('Try to add follower', () async {
    expect(
        await FollowerRequest.addFollowee(
            _restApiTestHelper.userProfileB.username),
        true,
        reason:
            'Could not add followee ${_restApiTestHelper.userProfileB.username}');

    await _restApiTestHelper.userProfileC.login();
    expect(
        await FollowerRequest.addFollowee(
            _restApiTestHelper.userProfileB.username),
        true,
        reason:
            'Could not add followee ${_restApiTestHelper.userProfileB.username}');
  });

  test('Try to get Followee of userProfileA', () async {
    await _restApiTestHelper.userProfileA.login();

    var followees = await FollowerRequest.getFollowees();

    expect(followees.length, 1, reason: 'Followee not found');
    expect(followees[0].name, _restApiTestHelper.userProfileB.username,
        reason: 'Wrong followee found');
  });

  test('Try to get Follower of userProfileB', () async {
    await _restApiTestHelper.userProfileB.login();

    var followers = await FollowerRequest.getFollowers();

    expect(followers.length, 2, reason: 'Follower not found');
    expect(
        followers[0].name.indexOf(_restApiTestHelper.userProfileA.username) >=
                0 ||
            followers[1]
                    .name
                    .indexOf(_restApiTestHelper.userProfileA.username) >=
                0,
        true,
        reason: 'Wrong follower found');

    expect(
        followers[0].name.indexOf(_restApiTestHelper.userProfileC.username) >=
                0 ||
            followers[1]
                    .name
                    .indexOf(_restApiTestHelper.userProfileC.username) >=
                0,
        true,
        reason: 'Wrong follower found');
  });

  test('Try to get friends', () async {
    await FollowerRequest.addFollowee(_restApiTestHelper.userProfileA.username);

    var friends = await FollowerRequest.getFriends();
    expect(friends.length, 1, reason: 'Friend not found');
    expect(friends[0].name, _restApiTestHelper.userProfileA.username,
        reason: 'Wrong friend found');
  });

  test('Try to remove followee', () async {
    // UserProfileB
    expect(
        await FollowerRequest.removeFollowee(
            _restApiTestHelper.userProfileA.username),
        true,
        reason: 'Could not remove followee');

    expect((await FollowerRequest.getFollowees()).length, 0,
        reason: 'Followees found');

    // UserProfileC
    await _restApiTestHelper.userProfileC.login();
    expect(
        await FollowerRequest.removeFollowee(
            _restApiTestHelper.userProfileB.username),
        true,
        reason: 'Could not remove followee');

    expect((await FollowerRequest.getFollowees()).length, 0,
        reason: 'Followees found');

    // UserProfileA
    await _restApiTestHelper.userProfileA.login();
    expect(
        await FollowerRequest.removeFollowee(
            _restApiTestHelper.userProfileB.username),
        true,
        reason: 'Could not remove followee');

    expect((await FollowerRequest.getFollowees()).length, 0,
        reason: 'Followees found');
  });

  tearDownAll(() async {
    // Clear all
    await _restApiTestHelper.dispose();
  });
}
