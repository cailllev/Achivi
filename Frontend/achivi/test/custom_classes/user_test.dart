import 'package:flutter_test/flutter_test.dart';

import 'package:achivi/models/follower.dart';
import 'package:achivi/models/user_profile.dart';

import '../debug/demo_populate.dart';

void main() {
  group('friends', () {
    UserProfile user;
    // Follower friend1 = Follower('Vonahsan', '');
    Follower friend2 = Follower('Kybursas', '');
    Follower friend3 = Follower('Pathijer', '');

    setUp(() {
      user = DemoPopulate.getDemoUser();
    });

    test('calculates friends', () {
      expect(user.getNrOfFriends(), 2);
    });

    test('delete a follows', () {
      user.deleteFollowByUserName(friend2.name);
      expect(user.getNrOfFriends(), 1);
    });

    test('add a follow and get followed', () {
      user.follows.add(friend3);
      user.followers.add(friend3);
      expect(user.getNrOfFriends(), 3);
    });

    test('JSON to user', () {
      var model = {
        'name': 'some name',
        'privilege': 'guest'
      };
      UserProfile userFromJson = new UserProfile.fromJson(model);
      UserProfile userToCompare = new UserProfile(username: 'some name', privilege: 'guest');
      expect(userFromJson.username, userToCompare.username);
      expect(userFromJson.privilege, userToCompare.privilege);
    });

    test('Achievement score', () {
      expect(user.getAchievementScore(), 105);
    });
  });
}
