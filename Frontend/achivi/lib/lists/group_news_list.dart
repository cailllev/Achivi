import 'package:achivi/lists/news_abstract_list.dart';
import 'package:achivi/models/news.dart';
import 'package:achivi/requests/news_request.dart';

class GroupNewsList extends NewsAbstractList {
  static List<News> _allNews;
  static String groupName;

  set group(String groupNameValue) {
    groupName = groupNameValue;
  }

  Future<bool> update() async {
    try {
      _allNews = await NewsRequest.getGroupNews(groupName);
    } catch (e) {
      print('Request abgewiesen mit: $e');
      return false;
    }
    return true;
  }

  @override
  List<News> getList() {
    sort();
    return _allNews;
  }

  sort() {
    Comparator<News> newsComparator = (b, a) => a.date.compareTo(b.date);
    _allNews.sort(newsComparator);
  }
}
