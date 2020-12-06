import 'package:achivi/lists/followers_abstract_list.dart';
import 'package:achivi/models/follower.dart';
import 'package:achivi/requests/follower_request.dart';

class FollowsList extends FollowersAbstractList {
  static List<Follower> _follows;

  FollowsList() {
    this.update();
  }

  @override
  Future<bool> update() async {
    try {
      _follows = await FollowerRequest.getFollowees();
    } catch (e) {
      print(e);
      return false;
    }

    return true;
  }

  @override
  List<Follower> getList() {
    return _follows;
  }

  bool isFollowing(String name) {
    bool result = false;
    _follows.forEach((f) {
      if (f.name == name) {
        result = true;
        return;
      }
    });

    return result;
  }

  void addFollowee(String name) {
    _follows.add(new Follower(name, null));
  }

  void removeFollowee(String name) {
    var toRemove;
    _follows.forEach((f) {
      if (f.name == name) {
        toRemove = f;
        return;
      }
    });

    _follows.remove(toRemove);
  }
}
