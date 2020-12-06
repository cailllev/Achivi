import 'package:achivi/lists/news_abstract_list.dart';
import 'package:achivi/models/news.dart';
import 'package:achivi/requests/news_request.dart';

class AllNewsList extends NewsAbstractList {
  static List<News> _allNews;

  AllNewsList() {
    this.update();
  }
  Future<bool> update() async {
    try {
      _allNews = await NewsRequest.getAllNews();
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
