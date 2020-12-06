import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'package:achivi/models/follower.dart';
import 'package:achivi/models/form_validator.dart';
import 'package:achivi/services/data_services.dart';
import 'package:achivi/services/data_utility.dart';

class AddMembersToGroupForm extends StatefulWidget {
  final String groupName;

  const AddMembersToGroupForm({Key key, @required this.groupName})
      : super(key: key);

  @override
  State<StatefulWidget> createState() => new _AddMembersToGroupFormState();
}

class _AddMembersToGroupFormState extends State<AddMembersToGroupForm> {
  FormValidator validator = new FormValidator();

  final _globalKey = GlobalKey<ScaffoldState>();

  String _groupName = "";
  List<Follower> myFollowers = new List<Follower>();
  Map selection = Map<String, bool>();
  List<String> selectedFollowers = [];
  String _selectedFollowersListText;
  bool _initialized = false;

  initState() {
    super.initState();
    _groupName = this.widget.groupName;
    _selectedFollowersListText =
        'Freunde zum Hinzufügen zur Gruppe \'$_groupName\' werden geladen';

    print(_groupName);
    myFollowers = DataService.followersList.getList();
    updateFollowersNotInGroup().then((_) {
      setState(() {
        int i;
        for (i = 0; i < myFollowers.length; i++) {
          selection[myFollowers[i].name] = false;
        }

        _selectedFollowersListText =
            'Es wurden keine Freunde zum Hinzufügen zur Gruppe \'$_groupName\' gefunden.';
        _initialized = true;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return new Scaffold(
      key: _globalKey,
      appBar: new AppBar(
        title: new Text("Freund hinzufügen",
            style: Theme.of(context).textTheme.headline6),
        centerTitle: true,
      ),
      body: Container(
        color: Theme.of(context).backgroundColor,
        padding: EdgeInsets.all(16.0),
        child: new Column(
          children: <Widget>[
            Flexible(flex: 2, child: Container(child: _buildInfoText())),
            Flexible(
                flex: 5,
                child: Padding(
                  padding: const EdgeInsets.only(top: 12),
                  child: Container(child: _friendsList()),
                )),
            Flexible(flex: 2, child: Container(child: _buildButtons()))
          ],
        ),
      ),
    );
  }

  Widget _buildInfoText() {
    return Center(
      child: SingleChildScrollView(
        child: new Column(
          children: <Widget>[
            new Text(
              'Wähle Freunde aus um sie hinzuzufügen.',
              style: Theme.of(context)
                  .textTheme
                  .headline2
                  .copyWith(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  Widget _friendsList() {
    if (!_initialized) {
      return Flexible(
          child: Center(
        child: Text(
          _selectedFollowersListText,
          textAlign: TextAlign.center,
        ),
      ));
    }
    return Container(
      child: ListView.builder(
        itemCount: myFollowers.length,
        itemBuilder: _getListItemTile,
      ),
    );
  }

  Widget _getListItemTile(BuildContext context, int index) {
    return ListTile(
        onTap: null,
        leading: Icon(
          Icons.perm_identity,
          size: 30,
          color: Colors.black,
        ),
        title: new Row(
          children: <Widget>[
            new Expanded(
              child: Text(myFollowers[index].name,
                  style: Theme.of(context).textTheme.headline2),
            ),
            new Checkbox(
                checkColor: Theme.of(context).primaryColorDark,
                activeColor: Theme.of(context).primaryColorLight,
                value: selection[myFollowers[index].name],
                onChanged: (bool value) {
                  setState(() {
                    if (value) {
                      selection[myFollowers[index].name] = true;
                    } else {
                      selection[myFollowers[index].name] = false;
                    }
                  });
                })
          ],
        ));
  }

  Widget _buildButtons() {
    return new Container(
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.only(top: 30),
          child: new Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                width: double.maxFinite,
                height: 50,
                child: Builder(
                  builder: (context) => RaisedButton(
                    child: new Text('Hinzufügen',
                        style: Theme.of(context).textTheme.button),
                    onPressed: () {
                      _addFriendToGroup();
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void getChecked(key, value) {
    if (value == true) {
      if (!selectedFollowers.contains(key)) {
        selectedFollowers.add(key);
      }
    }
  }

  Future<List> getGroupUsers() async {
    List groupUsersRaw = [];
    List<String> groupUsers = [];
    var url = 'api/groups/' + _groupName + '/members';
    var responded = await DataUtility.get(url);
    var value = responded;
    print(value.body);
    print(value.statusCode);

    groupUsersRaw = json.decode(value.body)['message'];
    for (var i = 0; i < groupUsersRaw.length; i++) {
      groupUsers.add(groupUsersRaw[i].toString());
      groupUsers[i] = groupUsers[i].replaceAll('{name:', '');
      groupUsers[i] = groupUsers[i].replaceAll('}', '');
      groupUsers[i] = groupUsers[i].replaceAll(', privilege: admin', '');
      groupUsers[i] = groupUsers[i].replaceAll(', privilege: member', '');
      groupUsers[i] = groupUsers[i].trim();
    }
    print("list:");
    print(groupUsersRaw);
    print(groupUsers);
    return groupUsers;
  }

  Future<void> updateFollowersNotInGroup() async {
    List<String> groupUsers = await getGroupUsers();

    if (groupUsers.length < 1) {
      print('Gruppenlänge 0');
    }

    for (var i = 0; i < myFollowers.length; i++) {
      for (var j = 0; j < groupUsers.length; j++) {
        print(myFollowers[i].name);
        print(groupUsers[j]);

        if (myFollowers[i].name == groupUsers[j]) {
          myFollowers.removeAt(i);
          i = 0;
          j = 0;
        }
      }
    }
    print("hier");
    print(myFollowers[0].name);
  }

  void _addFriendToGroup() {
    selectedFollowers.clear();
    selection.forEach(getChecked);
    print(selectedFollowers);
    print(_groupName);
    var url = 'api/groups/' + _groupName + '/members';
    var msg = {
      'users': jsonEncode(selectedFollowers),
    };
    print(url);
    print(msg);
    var responded = DataUtility.post(url, msg);
    responded.then((value) {
      print(value.body);
      print(value.statusCode);
      if (value.statusCode == 200) {
        _globalKey.currentState.showSnackBar(SnackBar(
            content: Text('Freunde wurden hinzugefügt.'),
            action: SnackBarAction(
              label: 'Zur Übersicht',
              onPressed: () {
                Navigator.pushNamed(context, '/GroupScreen');
              },
            )));
      } else {
        _globalKey.currentState
            .showSnackBar(SnackBar(content: Text('Fehler beim hinzufügen')));
      }
    });
  }
}
