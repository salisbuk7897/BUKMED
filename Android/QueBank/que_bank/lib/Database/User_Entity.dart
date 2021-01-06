class Users {
  int id;
  String firstName;
  String lastName;
  String school;
  String dept;
  String level;
  String username;
  String role;
  dynamic password;

  Users(this.id, this.firstName, this.lastName, this.level, this.username, this.password, this.role);

  Map<String, dynamic> toMap() {
    var map = <String, dynamic>{
      'id': id,
      'firstName': firstName,
      'lastName': lastName,
      'school': school,
      'dept': dept,
      'level' : level,
      'username': username,
      'role' : role,
      'password': password,
    };
    return map;
  }

  Users.fromMap(Map<String, dynamic> map) {
    id = map['id'];
    firstName = map['firstName'];
    lastName = map['lastName'];
    school = map['school'];
    dept = map['dept'];
    level = map['level'];
    username = map['username'];
    role = map['role'];
    password = map['password'];
  }
}