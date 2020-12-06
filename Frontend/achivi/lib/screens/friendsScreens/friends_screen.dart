import 'package:flutter/material.dart';

import 'package:achivi/screens/friendsScreens/friends_detail_screen.dart';
import 'package:achivi/services/data_services.dart';

class FriendsScreen extends StatefulWidget {
  @override
  _FriendsScreenState createState() => _FriendsScreenState();
}

class _FriendsScreenState extends State<FriendsScreen> {
  @override
  void initState() {
    super.initState();
    DataService.friendsList.update().then((r) => setState(() {}));
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
            _friendsList(),
          ],
        ),
      ),
    );
  }

  Widget _friendsList() {
    return new Expanded(
      child: new ListView.builder(
        itemCount: DataService.friendsList.getList().length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.perm_identity,
                size: 30,
                color: Colors.black,
              ),
              title: Text(DataService.friendsList.getList()[index].name,
                  style: Theme.of(context).textTheme.headline2),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FriendDetailScreen(
                        userName:
                            DataService.friendsList.getList()[index].name),
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
