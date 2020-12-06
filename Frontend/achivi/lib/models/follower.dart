class Follower {
  final String name;
  final String profilePicture;

  Follower(this.name, this.profilePicture);

  Follower.fromJson(Map json)
      : name = json['profile_name'],
        profilePicture = json['profile_picture'];

  Map toJson() {
    return {'name': name, 'profilePicture': profilePicture};
  }
}
