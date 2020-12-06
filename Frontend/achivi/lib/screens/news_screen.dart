import 'package:flutter/material.dart';

import 'package:achivi/components/news_card.dart';
import 'package:achivi/lists/all_news_list.dart';
import 'package:achivi/models/news.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  var news = new List<News>();
  final globalKey = GlobalKey<ScaffoldState>();

  initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _getNews();
    });
  }

  _getNews() async {
    AllNewsList allNewsList = new AllNewsList();
    await allNewsList.update();
    setState(() {
      news = allNewsList.getList();
    });
  }

  dispose() {
    super.dispose();
  }

//baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: globalKey,
      appBar: new AppBar(
        title: new Text("FEED", style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[_myListView()],
        ),
      ),
    );
  }

  Widget _myListView() {
    print('Wird allgemein gebaut');
    return Flexible(
      child: ListView.builder(
        itemCount: news.length,
        itemBuilder: (context, index) {
          final newsItem = news[index];
          print(newsItem);
          return NewsCard(
            news: newsItem,
          );
        },
      ),
    );
  }
}
