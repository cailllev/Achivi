import 'package:flutter/material.dart';

import 'package:achivi/models/news.dart';

class NewsCard extends StatelessWidget {
  final News news;

  NewsCard({this.news});

  @override
  Widget build(BuildContext context) {
    print('NewsCard: Wird erstellt');
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15.0),
      ),
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(news.category.toUpperCase(),
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.left,
                  maxLines: 2,
                  style: Theme.of(context).textTheme.headline3),
              Padding(
                padding: EdgeInsets.fromLTRB(0, 10, 0, 20),
                child: Text(
                  news.text,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.left,
                  maxLines: 3,
                  style: Theme.of(context)
                      .textTheme
                      .headline1
                      .copyWith(letterSpacing: 0.7),
                ),
              ),
              Text(
                news.getAge(),
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.left,
                maxLines: 1,
                style: Theme.of(context).textTheme.bodyText2,
              )
            ]),
      ),
    );
  }
}
