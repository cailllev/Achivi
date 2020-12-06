class News {
  String link;
  DateTime date;
  String category;
  String text;

  News(this.category, this.date, this.link, this.text);

  News.fromJson(Map json)
      : link = json['link'],
        date = json['date'],
        category = json['category'],
        text = json['text'];

  Map toJson() {
    return {'link': link, 'date': date, 'category': category, 'text': text};
  }

  String getAge() {
    var now = new DateTime.now();
    var difference = now.difference(this.date);
    if (difference.inDays > 1) {
      return 'vor ${difference.inDays} Tagen';
    } else if (difference.inDays == 1) {
      return 'vor ${difference.inDays} Tag';
    } else if (difference.inHours > 1) {
      return 'vor ${difference.inHours} Stunden';
    } else if (difference.inHours == 1) {
      return 'vor ${difference.inHours} Stunde';
    } else if (difference.inMinutes > 1) {
      return 'vor ${difference.inMinutes} Minuten';
    } else {
      return 'jetzt';
    }
  }
}
