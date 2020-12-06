import 'dart:convert';

import 'package:achivi/lists/followers_list.dart';
import 'package:achivi/lists/follows_list.dart';
import 'package:achivi/lists/friends_list.dart';
import 'package:achivi/services/data_utility.dart';

class DataService {
  static final FollowsList followsList = new FollowsList();
  static final FollowersList followersList = new FollowersList();
  static final FriendsList friendsList = new FriendsList();
  static String profileName;

  static void updateAll() {
    followersList.update();
    followsList.update();
    friendsList.update();
  }

  static void setProfileName() {
    var responded = DataUtility.get('api/profiles');
    responded.then((value) {
      profileName = json.decode(value.body)['profile_name'];
      updateAll();
    });
  }
}
