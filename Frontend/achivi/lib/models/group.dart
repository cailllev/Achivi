import 'package:achivi/models/user_profile.dart';

class Group {
  String groupName;
  //String _groupCategory;
  List<UserProfile> members;

  /// creates Group Object
  /// [groupID] should be Unique and is given by the server on creation \n
  /// [groupName] is the groups name ...duh...
  /// [users] and [groupDescription] can be added at creation.
  /// if [null] default values are used.
  /// for [users] = new empty list.
  /// for [groupDescription] = empty string = ''
  ///
  ///

  Group({this.groupName, this.members});

  factory Group.fromJson(Map<String, dynamic> json) {
    return new Group(
        groupName: json['name'],
        members: Iterable.castFrom(json['members'])
            .map((value) => new UserProfile.fromJson(value))
            .toList());
  }

  bool isAdmin(String username) {
    bool admin = false;
    members.forEach((member) {
      if (member.username == username && member.privilege == 'admin') {
        admin = true;
        return;
      }
    });

    return admin;
  }
}

/// Unfold to show Getter/Setter
//region Getter/Setter

/*int get groupID => _groupID;
  List<UserProfile> get users => _users;
  String get groupName => _groupName;*/

/*set users(List<UserProfile> users) {
    _members = users;
  }*/

//String get groupDescription => _groupDescription;

/*set groupDescription(String groupDescription) {
    _groupDescription = groupDescription;
  }*/

/*List<Achievement> get achievements => _achievements;

  set achievements(List<Achievement> achievements) {
    _achievements = achievements;
  }*/
//endregion
