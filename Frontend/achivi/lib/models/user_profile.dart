import 'package:achivi/models/achievement.dart';
import 'package:achivi/models/follower.dart';

class UserProfile {
  String userPicture;
  String firstName;
  String lastName;
  String birthDate;
  String username;
  String privilege;
  String bio;

  List<Follower> followers;
  List<Follower> follows;

  int points;

  List<Achievement> achievements;

  UserProfile(
      {this.userPicture,
      this.firstName,
      this.lastName,
      this.birthDate,
      this.username,
      this.privilege,
      this.bio,
      this.followers,
      this.follows,
      this.points,
      this.achievements});

  void deleteFollowByUserName(String username) {
    follows.removeWhere((u) => u.name == username);
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return new UserProfile(
      username: json['name'],
      privilege: json['privilege'],
    );
  }

  //region Getter / Setter methods

  int getAchievementScore() {
    int achievementScore = 0;
    for (int i = 0; i < achievements.length; i++) {
      achievementScore += achievements.elementAt(i).points;
    }
    return achievementScore;
  }

  int getNrOfFriends() {
    int value = followers.toSet().intersection(follows.toSet()).length;

    return value;
  }

//endregion
}
