import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:achivi/components/add_members_to_group_form.dart';
import 'package:achivi/models/group.dart';
import 'package:achivi/models/user_profile.dart';
import 'package:achivi/screens/friendsScreens/friends_detail_screen.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class GroupMemberScreen extends StatefulWidget {
  final Group group;
  const GroupMemberScreen({Key key, @required this.group}) : super(key: key);

  @override
  State<StatefulWidget> createState() => _GroupMemberScreenState();
}

class _GroupMemberScreenState extends State<GroupMemberScreen> {
  var _groupListText;

  void _getGroupMembers() {
    var url = 'api/groups/${this.widget.group.groupName}/members';
    var responded = DataUtility.get(url);
    responded.then((value) {
      print(value.statusCode);
      if (value.statusCode == 200) {
        setState(() {
          Iterable list = json.decode(value.body)['message'];
          this.widget.group.members =
              list.map((model) => UserProfile.fromJson(model)).toList();

          _groupListText =
              'Es konnten keine Mitglieder für die Gruppe ${this.widget.group.groupName} gefunden werden.';
        });
      } else {
        _groupListText =
            'Die Mitglieder für die Gruppe ${this.widget.group.groupName} konnten nicht geladen werden.';
        Scaffold.of(context).showSnackBar(SnackBar(
          content: Text(_groupListText),
        ));
        setState(() {});
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _groupListText =
        'Mitglieder für ${this.widget.group.groupName} werden geladen...';
    _getGroupMembers();
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      body: Container(
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            _membersList(),
            _getAddMemberButton(),
          ],
        ),
      ),
    );
  }

  Widget _getAddMemberButton() {
    return new Visibility(
      visible: this.widget.group.isAdmin(DataService.profileName),
      child: Align(
        alignment: Alignment.bottomRight,
        child: FloatingActionButton(
          backgroundColor: Theme.of(context).primaryColorDark,
          child: Icon(Icons.add),
          onPressed: () {
            print('Add Member');
            showDialog(
              context: context,
              builder: (BuildContext context) => AddMembersToGroupForm(
                groupName: this.widget.group.groupName,
              ),
            ).then((_) => setState(() {
                  // https://stackoverflow.com/questions/57109527/how-to-refresh-the-page-when-user-comes-back-to-it-from-any-other-page-using-bac
                  _getGroupMembers();
                }));
          },
        ),
      ),
    );
  }

  Widget _membersList() {
    if (this.widget.group.members.length == 0) {
      return Flexible(
          child: Center(
        child: Text(
          _groupListText,
          textAlign: TextAlign.center,
        ),
      ));
    }

    return Flexible(
      child: ListView.builder(
        itemCount: this.widget.group.members.length,
        itemBuilder: (context, index) {
          return Card(
            child: ListTile(
              leading: Icon(
                Icons.perm_identity,
                size: 30,
                color: Colors.black,
              ),
              title: Text(this.widget.group.members[index].username,
                  style: Theme.of(context).textTheme.headline5),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => FriendDetailScreen(
                        userName: this.widget.group.members[index].username),
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
