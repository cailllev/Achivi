import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:achivi/components/create_achievement_form.dart';
import 'package:achivi/components/full_logo.dart';
import 'package:achivi/models/achievement.dart';
import 'package:achivi/requests/achievement_request.dart';
import 'package:achivi/screens/achievementScreen/achievement_detail_screen.dart';

class GroupAchievementScreen extends StatefulWidget {
  final String groupName;
  const GroupAchievementScreen({Key key, @required this.groupName})
      : super(key: key);

  @override
  State<StatefulWidget> createState() => _GroupAchievementScreenState();
}

class _GroupAchievementScreenState extends State<GroupAchievementScreen> {
  var _achievements = new List<Achievement>();
  var _achievementListText;

  void _getAchievements() async {
    AchievementRequest.getGroupAchievements(this.widget.groupName)
        .then(
          (achievements) => setState(() {
            _achievements = achievements;

            _achievementListText =
                'Es konnten keine Achievements für die Gruppe ${this.widget.groupName} gefunden werden.';
          }),
        )
        .catchError(
          (_) => setState(() {
            _achievementListText =
                'Die Achievements für die Gruppe ${this.widget.groupName} konnten nicht geladen werden.';
            Scaffold.of(context).showSnackBar(SnackBar(
              content: Text(_achievementListText),
            ));
          }),
        );
  }

  @override
  void initState() {
    super.initState();
    _achievementListText =
        'Achievements für ${this.widget.groupName} werden geladen...';
    _getAchievements();
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            _achievementListView(),
            Align(
              alignment: Alignment.bottomRight,
              child: FloatingActionButton(
                backgroundColor: Theme.of(context).primaryColorDark,
                child: Icon(Icons.add),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) => CreateAchievementForm(
                      groupName: this.widget.groupName,
                    ),
                  ).then((_) => setState(() {
                        // https://stackoverflow.com/questions/57109527/how-to-refresh-the-page-when-user-comes-back-to-it-from-any-other-page-using-bac
                        _getAchievements();
                      }));
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _achievementListView() {
    if (_achievements.length == 0) {
      return Flexible(
          child: Center(
        child: Text(
          _achievementListText,
          textAlign: TextAlign.center,
        ),
      ));
    }

    return Flexible(
      child: ListView.builder(
        itemCount: _achievements.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: FullLogo(),
              title: Text(_achievements[index].name,
                  style: Theme.of(context).textTheme.headline5),
              subtitle: Text(_achievements[index].description,
                  style: Theme.of(context).textTheme.headline5),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AchievementDetailScreen(
                        achievement: _achievements[index]),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
