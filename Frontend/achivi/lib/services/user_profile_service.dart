import 'dart:convert';

import 'package:achivi/models/follower.dart';
import 'package:achivi/models/user_profile.dart';
import 'package:achivi/requests/follower_request.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';
import 'package:http/http.dart';

class UserProfileService {
  static final String profilePath = 'api/profiles/';
  static final String achievementsPath = 'api/achievement/';
  // Api fields:
  static final String apiUsername = 'profile_name';
  static final String apiBirthDate = 'birthdate';
  static final String apiUserPicture = 'profile_picture';
  static final String apiFirstName = 'firstname';
  static final String apiLastName = 'lastname';
  static final String apiBio = 'bio';

  static Future<UserProfile> getCurrUserProfile() async {
    Map userMap = await _getUserProfile();
    return await createUserProfile(userMap);
  }

  static Future<UserProfile> createUserProfile(Map userMap) async {
    List follower = await FollowerRequest.getFollowers();
    List follows = await FollowerRequest.getFollowees();
    int points = 0;

    Response response = await DataUtility.get(
        'api/profiles/${DataService.profileName}/achievements/points');
    if (response.statusCode == 200 && json.decode(response.body) != null) {
      points = int.parse(json.decode(response.body));
    }

    return UserProfile(
      username: userMap[apiUsername],
      firstName: userMap[apiFirstName] ?? '',
      lastName: userMap[apiLastName] ?? '',
      birthDate: userMap[apiBirthDate] ?? null,
      bio: userMap[apiBio] ?? '',
      followers: follower ?? new List<Follower>(),
      follows: follows ?? new List<Follower>(),
      points: points,
    );
  }

  /// gets other users Profile
  /// takes [username] as parameter
  static Future<UserProfile> getGuestUserProfile(String username) async {
    Map userMap = await _getUserProfile(username);
    return await createUserProfile(userMap);
  }

  /// gets other users Profile
  /// takes [Follower] object as parameter
  static Future<UserProfile> getUserProfileByFollow(Follower follow) async {
    Map userMap = await _getUserProfile(follow.name);
    return await createUserProfile(userMap);
  }

  static Future<Map> _getUserProfile([username]) async {
    String profile = username ?? '';
    var response = await DataUtility.get(profilePath + profile);
    Map data = jsonDecode(response.body);
    print(data);
    return data;
  }
}
