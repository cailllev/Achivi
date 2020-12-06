
import 'package:flutter/material.dart';

import 'package:achivi/components/full_logo.dart';
import 'package:achivi/models/achievement.dart';
import 'package:achivi/requests/achievement_request.dart';
import 'package:achivi/screens/achievementScreen/achievement_detail_screen.dart';

class AchievementsScreen extends StatefulWidget {
  const AchievementsScreen({Key key}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _AchievementsScreenState();
}

class _AchievementsScreenState extends State<AchievementsScreen> {
  var achievements = new List<Achievement>();
  final globalKey = GlobalKey<ScaffoldState>();

  _getAchievements() {
    AchievementRequest.getGlobalAchievements()
        .then((achvs) => setState(() => achievements = achvs))
        .catchError((_) {
      final snackBar = SnackBar(content: Text('Internal Server Error'));
      globalKey.currentState.showSnackBar(snackBar);
    });
  }

  initState() {
    super.initState();
    _getAchievements();
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
        title: new Text("ACHIEVEMENTS",
            style: Theme.of(context).textTheme.headline6),
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

  Container _getLogo(Achievement achievement) {
    if (!achievement.claimed) {
      return Container(
        child: FullLogo(),
      );
    } else {
      return Container(
        child: Padding(
          padding: const EdgeInsets.all(2.0),
          child: FullLogo(),
        ),
        decoration: BoxDecoration(
            color: achievement.getClassColor(),
            borderRadius: BorderRadius.all(Radius.circular(18))),
      );
    }
  }

  Widget _myListView() {
    return Flexible(
      child: ListView.builder(
        itemCount: achievements.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: _getLogo(achievements[index]),
              title: Text(achievements[index].name,
                  style: Theme.of(context).textTheme.headline2),
              subtitle: Text(achievements[index].categoryName,
                  style: Theme.of(context).textTheme.headline1),
              trailing: Row(mainAxisSize: MainAxisSize.min, children: <Widget>[
                _createClaimButton(achievements[index]),
                _createFlagButton(achievements[index])
              ]),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => AchievementDetailScreen(
                        achievement: achievements[index]),
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
      backgroundColor:
          achievement.flagged ? Theme.of(context).primaryColor : Colors.white,
      child: IconButton(
          icon: Icon(
            Icons.flag,
            color: achievement.flagged
                ? Colors.white
                : Theme.of(context).primaryColorDark,
          ),
          onPressed: () {
            if (achievement.flagged) {
              AchievementRequest.deflagAchievement(achievement.id)
                  .then((success) {
                if (success) {
                  setState(() => achievement.flagged = false);
                }
              });
            } else {
              AchievementRequest.flagAchievement(achievement.id)
                  .then((success) {
                if (success) {
                  setState(() => achievement.flagged = true);
                }
              });
            }
          }),
    );
  }

  _createClaimButton(Achievement achievement) {
    return Visibility(
      visible: !achievement.claimed,
      child: CircleAvatar(
        radius: 20,
        backgroundColor:
            achievement.claimed ? Theme.of(context).primaryColor : Colors.white,
        child: IconButton(
            icon: Icon(
              Icons.add,
              color: achievement.claimed
                  ? Colors.white
                  : Theme.of(context).primaryColorDark,
            ),
            onPressed: () {
              AchievementRequest.claimAchievement(achievement.id)
                  .then((success) {
                if (success) {
                  setState(() => achievement.claimed = true);
                }
              });
            }),
      ),
    );
  }
}
