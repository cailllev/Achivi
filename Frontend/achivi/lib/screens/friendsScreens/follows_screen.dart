import 'package:flutter/material.dart';

import 'package:achivi/requests/follower_request.dart';
import 'package:achivi/screens/friendsScreens/friends_detail_screen.dart';
import 'package:achivi/services/data_services.dart';

class FollowsScreen extends StatefulWidget {
  @override
  _FollowsScreenState createState() => _FollowsScreenState();
}

class _FollowsScreenState extends State<FollowsScreen> {
  @override
  void initState() {
    super.initState();
    DataService.followsList.update().then((r) => setState(() {}));
  }

  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            _followeesList(),
          ],
        ),
      ),
    );
  }

  Widget _followeesList() {
    return new Expanded(
      child: new ListView.builder(
        itemCount: DataService.followsList.getList().length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.perm_identity,
                size: 30,
                color: Colors.black,
              ),
              title: Text(DataService.followsList.getList()[index].name,
                  style: Theme.of(context).textTheme.headline2),
              trailing: SizedBox(
                child: _createFollowingButton(
                  DataService.followsList.getList()[index].name,
                ),
              ),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FriendDetailScreen(
                        userName:
                            DataService.followsList.getList()[index].name),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }

  _createFollowingButton(String name) {
    return IconButton(
        icon: Icon(
          Icons.remove_circle,
          color: Theme.of(context).primaryColorDark,
        ),
        onPressed: () {
          FollowerRequest.removeFollowee(name).then((success) {
            if (success) {
              DataService.followsList.removeFollowee(name);
              setState(() {});
            }
          });

          // https://flutter.dev/docs/cookbook/design/snackbars
          Scaffold.of(context).showSnackBar(new SnackBar(
            content: Text('Folge \'$name\' nicht mehr...'),
            action: SnackBarAction(
              label: 'Rückgangig',
              onPressed: () {
                // Follow again (undo removing)
                FollowerRequest.addFollowee(name).then((success) {
                  if (success) {
                    DataService.followsList.addFollowee(name);
                    setState(() {});
                  }
                });
              },
            ),
            duration: Duration(seconds: 7),
          ));
        });
  }
}
