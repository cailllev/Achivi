import 'package:achivi/models/achievement.dart';
import 'package:achivi/models/follower.dart';
import 'package:achivi/models/user_profile.dart';

class DemoPopulate {
//  static List<Group> demoFillGroups(int nrOfEntries) {
//    List<Group> groups = new List();
//    for (int i = 0; i < nrOfEntries; i++) {
//      groups.add(
//          Group(i, 'demogroup$i', groupDescription: 'litte group Description'));
//    }
//    return groups;
//  }

  static UserProfile getDemoUser() {
    UserProfile demoUser = new UserProfile(username: 'Kalinnic');
    Follower friend1 = Follower('Vonahsan', '');
    Follower friend2 = Follower('Kybursas', '');

    demoUser.followers = [
      friend1,
      friend2,
      Follower('Strauma8', ''),
      Follower('Wirthsel', '')
    ];
    demoUser.follows = [friend1, friend2];
    demoUser.achievements = getDemoAchievement(7);
    demoUser.bio =
        'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.';

    return demoUser;
  }

  static List<Achievement> getDemoAchievement(nrOfEntries) {
    List<Achievement> achievements = new List();
    for (int i = 0; i < nrOfEntries; i++) {
      achievements.add(Achievement(
        name: 'Demo Achievement nr:$i',
        description: 'this is a small description for achievement nr:$i',
        points: (i * 5),
      ));
    }
    return achievements;
  }
}
