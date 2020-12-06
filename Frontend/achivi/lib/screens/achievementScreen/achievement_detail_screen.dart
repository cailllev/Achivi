import 'package:flutter/material.dart';

import 'package:achivi/models/achievement.dart';

class AchievementDetailScreen extends StatelessWidget {
  final Achievement achievement;

  AchievementDetailScreen({Key key, @required this.achievement})
      : super(key: key);

// Globals
  final TextStyle _title = TextStyle(
      fontFamily: 'Roboto',
      fontSize: 15,
      color: Colors.black,
      fontWeight: FontWeight.w700);
  final TextStyle _text = TextStyle(
      fontFamily: 'Roboto',
      fontSize: 20,
      color: Colors.black,
      fontWeight: FontWeight.w400);

  //baut Seite als Widget auf.
  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      appBar: new AppBar(
        title: new Text("ACHIEVEMENT",
            style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            Flexible(
                fit: FlexFit.tight,
                flex: 1,
                child: Container(
                  child: _buildImage(),
                )),
            Flexible(
              fit: FlexFit.tight,
              flex: 2,
              child: Container(child: _buildText()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImage() {
    return Center(
      child: SingleChildScrollView(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            new Image(
              image: AssetImage('assets/images/logo_achivi.png'),
            ),
          ],
        ),
      ),
    );
  }

  // https://github.com/flutter/flutter/issues/3783
  bool notNull(Object o) => o != null;
  Widget _buildText() {
    return Container(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(top: 30),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              _getNameCard(),
              _getDescriptionCard(),
              _getCategoryNameCard(),
              _getCategoryDescriptionCard(),
              _getPointCard(),
              _getClassNameCard(),
            ].where(notNull).toList(),
          ),
        ),
      ),
    );
  }

  Card _getNameCard() {
    if (achievement.name == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('NAME', style: _title),
            subtitle: Text(achievement.name, style: _text),
          ),
        ],
      ),
    );
  }

  Card _getDescriptionCard() {
    if (achievement.description == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('BESCHREIBUNG', style: _title),
            subtitle: Text(achievement.description, style: _text),
          ),
        ],
      ),
    );
  }

  Card _getCategoryNameCard() {
    if (achievement.categoryName == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('KATEGORIE', style: _title),
            subtitle: Text(achievement.categoryName, style: _text),
          ),
        ],
      ),
    );
  }

  Card _getCategoryDescriptionCard() {
    if (achievement.categoryDescription == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('KATEGORIE BESCHREIBUNG', style: _title),
            subtitle: Text(achievement.categoryDescription, style: _text),
          ),
        ],
      ),
    );
  }

  Card _getPointCard() {
    if (achievement.points == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('PUNKTE', style: _title),
            subtitle: Text('${achievement.points}', style: _text),
          ),
        ],
      ),
    );
  }

  Card _getClassNameCard() {
    if (achievement.className == null) {
      return null;
    }

    return new Card(
      child: new Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          ListTile(
            title: Text('KLASSE', style: _title),
            subtitle: Text('${achievement.className}', style: _text),
          ),
        ],
      ),
    );
  }
}
