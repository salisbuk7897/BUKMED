import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Database/tests_entity.dart';
import 'package:que_bank/Database/dbhelper.dart';

class Prep {
  String name;
  String title;
  int question;

  Prep(this.name, this.title, this.question);

  Map<String, dynamic> toMap() {
    var map = <String, dynamic>{
      'name': name,
      'title': title,
      'question' : question,
    };
    return map;
  }

  Prep.fromMap(Map<String, dynamic> map) {
    name = map['name'];
    title = map['title'];
    question = map['question'];
  }
}

Future<List<Prep>> getPrepList() async {
  List<Courses> courses = [];
  List<Prep> res = [];
  await DBHelper().getSelectedCourses().then((List<Courses> course){
    courses = course;
  });
  if(courses.length > 0){
    await countQuestions(courses).then((List<Prep> result){
      res = result;
    });
  }
  else{
    res = [];
  }
  //print('res $res');
  return res;
}

Future<List<Prep>> countQuestions(sc) async{

  List<Prep> testPreps = [];
  /*sc.map((e) async{
    print('sc ${e.name}');
    await DBHelper().getQuestions(e.name).then((List<Test> questions){
      DBHelper().getNumberOfQuestions(questions).then((int numberOfQuestions){
        var cPrep = Prep(sc.name, sc.title, numberOfQuestions);
        testPreps.add(cPrep);
      });
    });
  });*/
  for(int i = 0; i < sc.length; i++){
    List<Test> questions = await DBHelper().getQuestions(sc[i].name);
    int numberOfQuestions = await DBHelper().getNumberOfQuestions(questions);
    var cPrep = Prep(sc[i].name, sc[i].title, numberOfQuestions);
    //print('sc $cPrep');
    testPreps.add(cPrep);
  }
  return testPreps;
}


