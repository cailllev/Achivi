import 'package:flutter/material.dart';

import 'package:achivi/screens/friendsScreens/friends_detail_screen.dart';
import 'package:achivi/services/data_services.dart';

class FollowerScreen extends StatefulWidget {
  @override
  _FollowerScreenState createState() => _FollowerScreenState();
}

class _FollowerScreenState extends State<FollowerScreen> {
  final globalKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();

    DataService.followersList.update().then((r) => setState(() {}));
  }

  dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: globalKey,
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            _followersList(),
          ],
        ),
      ),
    );
  }

  Widget _followersList() {
    return new Expanded(
      child: new ListView.builder(
        itemCount: DataService.followersList.getList().length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.perm_identity,
                size: 30,
                color: Colors.black,
              ),
              title: Text(DataService.followersList.getList()[index].name,
                  style: Theme.of(context).textTheme.headline2),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FriendDetailScreen(
                        userName:
                            DataService.followersList.getList()[index].name),
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
