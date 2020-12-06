import 'package:achivi/lists/followers_abstract_list.dart';
import 'package:achivi/models/follower.dart';
import 'package:achivi/requests/follower_request.dart';

class FriendsList extends FollowersAbstractList {
  static List<Follower> _friends;

  FriendsList() {
    this.update();
  }
  Future<bool> update() async {
    try {
      _friends = await FollowerRequest.getFriends();
    } catch (e) {
      print('Request abgewiesen mit: $e');
      return false;
    }
    return true;
  }

  @override
  List<Follower> getList() {
    return _friends;
  }
}
