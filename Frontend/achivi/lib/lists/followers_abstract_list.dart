import 'package:flutter/cupertino.dart';

import 'package:achivi/models/follower.dart';

abstract class FollowersAbstractList {
  @required
  Future<bool> update();

  @required
  List<Follower> getList();
}
