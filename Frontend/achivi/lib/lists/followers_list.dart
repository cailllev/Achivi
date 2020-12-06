import 'package:achivi/lists/followers_abstract_list.dart';
import 'package:achivi/models/follower.dart';
import 'package:achivi/requests/follower_request.dart';

class FollowersList extends FollowersAbstractList {
  static List<Follower> _followers;

  Future<bool> update() async {
    try {
      _followers = await FollowerRequest.getFollowers();
    } catch (e) {
      print(e);
      return false;
    }

    return true;
  }

  @override
  List<Follower> getList() {
    return _followers;
  }
}
