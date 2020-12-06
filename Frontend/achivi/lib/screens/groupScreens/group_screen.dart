import 'dart:convert';

import 'package:flutter/material.dart';

import 'package:achivi/components/create_group_form.dart';
import 'package:achivi/models/group.dart';
import 'package:achivi/screens/groupScreens/group_detail_screen.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class GroupScreen extends StatefulWidget {
  @override
  _GroupScreenState createState() => _GroupScreenState();
}

class _GroupScreenState extends State<GroupScreen> {
  var groups = new List<Group>();
  final globalKey = GlobalKey<ScaffoldState>();

  _getGroups() {
    var url = 'api/profiles/${DataService.profileName}/groups';
    var responded = DataUtility.get(url);
    responded.then((value) {
      print('Staus: ${value.statusCode}');
      print('Body: ${value.body}');
      if (value.statusCode == 200) {
        print("success");
        setState(() {
          Iterable data = json.decode(value.body)['message'];
          groups = data.map<Group>((json) => Group.fromJson(json)).toList();
        });
      } else {
        final snackBar = SnackBar(content: Text('Internal Server Error'));
        globalKey.currentState.showSnackBar(snackBar);
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _getGroups();
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
            _groupList(),
            Align(
              alignment: Alignment.bottomRight,
              child: FloatingActionButton(
                backgroundColor: Theme.of(context).primaryColorDark,
                child: Icon(Icons.add),
                onPressed: () {
                  showDialog(
                    context: context,
                    builder: (BuildContext context) => CreateGroupForm(),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _groupList() {
    return Flexible(
      child: ListView.builder(
        itemCount: groups.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.group_work,
                size: 50,
                color: Colors.black,
              ),
              title: Text(groups[index].groupName,
                  style: Theme.of(context).textTheme.headline2),
              subtitle: Text(groups[index].members[0].username),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) =>
                        GroupDetailScreen(group: groups[index]),
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
