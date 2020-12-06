import 'package:flutter/material.dart';

import 'package:achivi/components/news_card.dart';
import 'package:achivi/lists/group_news_list.dart';
import 'package:achivi/models/news.dart';

class GroupNewsScreen extends StatefulWidget {
  final groupName;
  const GroupNewsScreen({Key key, this.groupName}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _GroupNewsScreenState();
}

class _GroupNewsScreenState extends State<GroupNewsScreen> {
  var news = new List<News>();
  final globalKey = GlobalKey<ScaffoldState>();

  initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _getNews();
    });
  }

  _getNews() async {
    GroupNewsList groupNewsList = new GroupNewsList();
    groupNewsList.group = widget.groupName;
    await groupNewsList.update();
    setState(() {
      news = groupNewsList.getList();
    });
  }

  dispose() {
    super.dispose();
  }

//baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    return new Container(
      padding: EdgeInsets.all(16.0),
      child: new Column(
        children: <Widget>[_myListView()],
      ),
    );
  }

  Widget _myListView() {
    return Flexible(
      child: ListView.builder(
        itemCount: news.length,
        itemBuilder: (context, index) {
          final newsItem = news[index];

          return NewsCard(
            news: newsItem,
          );
        },
      ),
    );
  }
}
