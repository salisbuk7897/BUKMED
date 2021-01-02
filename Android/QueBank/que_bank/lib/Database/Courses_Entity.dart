class Courses {
  int id;
  String name;
  String title;
  String selected;

  Courses(this.id, this.name, this.title, this.selected);

  Map<String, dynamic> toMap() {
    var map = <String, dynamic>{
      'id': id,
      'name': name,
      'title': title,
      'selected': selected,
    };
    return map;
  }

  Courses.fromMap(Map<String, dynamic> map) {
    id = map['id'];
    name = map['name'];
    title = map['title'];
    selected = map['selected'];
  }
}