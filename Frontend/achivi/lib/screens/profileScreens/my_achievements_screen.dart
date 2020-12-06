import 'package:flutter/material.dart';

import 'package:achivi/components/full_logo.dart';
import 'package:achivi/models/achievement.dart';
import 'package:achivi/requests/achievement_request.dart';
import 'package:achivi/screens/achievementScreen/achievement_detail_screen.dart';

class MyAchievementsScreen extends StatefulWidget {
  @override
  _MyAchievementsScreenState createState() => _MyAchievementsScreenState();
}

class _MyAchievementsScreenState extends State<MyAchievementsScreen> {
  var _achievements = new List<Achievement>();
  var _unflaggedAchievements = new List<Achievement>();
  var _achievementListText = 'Markierte Achievements werden geladen...';

  @override
  void initState() {
    super.initState();
    AchievementRequest.getFlaggedAchievements().then((value) => setState(() {
          _achievements = value;
          _achievementListText =
              'Es wurden keine markierte Achievements gefunden.';
        }));
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[_achievementsList()],
        ),
      ),
    );
  }

  Widget _achievementsList() {
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
              subtitle: Text(_achievements[index].categoryName,
                  style: Theme.of(context).textTheme.headline5),
              trailing: SizedBox(
                child: _createFlagButton(_achievements[index]),
              ),
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

  _createFlagButton(Achievement achievement) {
    return CircleAvatar(
      radius: 20,
      backgroundColor: Theme.of(context).primaryColor,
      child: IconButton(
          icon: Icon(
            Icons.flag,
            color: Colors.white,
          ),
          onPressed: () {
            AchievementRequest.deflagAchievement(achievement.id)
                .then((success) {
              if (success) {
                setState(() => _unflagAchievement(achievement.id));

                // https://flutter.dev/docs/cookbook/design/snackbars
                Scaffold.of(context).showSnackBar(new SnackBar(
                  content: Text(
                      'Die Markierung von \'${achievement.name}\' wurde entfernt...'),
                  action: SnackBarAction(
                    label: 'Rückgangig',
                    onPressed: () {
                      // Flag again (undo unflagging)
                      AchievementRequest.flagAchievement(achievement.id)
                          .then((success) {
                        print('undo success');
                        if (success) {
                          setState(
                              () => _undoUnflagAchievement(achievement.id));
                        }
                      });
                    },
                  ),
                  duration: Duration(seconds: 7),
                ));
              }
            });
          }),
    );
  }

  void _unflagAchievement(int id) {
    _flagAchievement(id, _achievements, _unflaggedAchievements);
  }

  void _undoUnflagAchievement(int id) {
    _flagAchievement(id, _unflaggedAchievements, _achievements);
  }

  void _flagAchievement(int id, List<Achievement> r, List<Achievement> a) {
    var flag;
    r.forEach((e) {
      if (e.id == id) {
        flag = e;
        return;
      }
    });

    r.remove(flag);
    a.add(flag);
  }
}
