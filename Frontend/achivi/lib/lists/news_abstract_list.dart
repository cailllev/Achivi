import 'package:flutter/cupertino.dart';

import 'package:achivi/models/news.dart';

abstract class NewsAbstractList {
  @required
  Future<bool> update();

  @required
  List<News> getList();
}
