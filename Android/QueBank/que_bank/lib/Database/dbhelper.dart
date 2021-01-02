import 'dart:async';
import 'dart:io' as io;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'Courses_Entity.dart';
import 'tests_entity.dart';
import 'dart:convert';

class DBHelper {
  static Database _db;
  static const String ID = 'id';
  static const String NAME = 'name';
  static const String TABLE = 'Courses';
  static const String DB_NAME = 'QueBank_f5.db';

  List<Courses> allCourses = [
    Courses(1, "ana", "Anatomy", "Not Selected"),
    Courses(2, "bio", "Biochemistry", "Not Selected"),
    Courses(3, "phy", "Physiology", "Not Selected"),
    Courses(4, "fmt", "Forensic Medicine & Toxicology", "Not Selected"),
    Courses(5, "mcb", "Microbiology", "Not Selected"),
    Courses(6, "pth", "Pathology", "Not Selected"),
    Courses(7, "phm", "Pharmacology", "Not Selected"),
    Courses(8, "ans", "Anesthesiology", "Not Selected"),
    Courses(9, "cmd", "Community Medicine", "Not Selected"),
    Courses(10, "dav", "Dermatology & Venereology", "Not Selected"),
    Courses(11, "obg", "Obstetrics & Gynecology", "Not Selected"),
    Courses(12, "opt", "Ophthalmology", "Not Selected"),
    Courses(13, "ort", "Orthopaedics", "Not Selected"),
    Courses(14, "oto", "Otorhinolaryngology", "Not Selected"),
    Courses(15, "pea", "Paediatrics", "Not Selected"),
    Courses(16, "psy", "Psychiatry", "Not Selected"),
    Courses(17, "sgy", "Surgery", "Not Selected"),
  ];

  Future<Database> get db async {
    if (_db != null) {
      return _db;
    }
    _db = await initDb();
    return _db;
  }

  chk() async{
    var check = await db;
    //print(check);
  }

  initDb() async {
    String documentsDirectory = await getDatabasesPath();
    String path = join(documentsDirectory, DB_NAME);
    var db = await openDatabase(path, version: 1, onCreate: _onCreate);
    return db;
  }

  _onCreate(Database db, int version) async {
    await db
        .execute("CREATE TABLE $TABLE ($ID INTEGER PRIMARY KEY, $NAME TEXT, title TEXT, selected TEXT)");

    await db
        .execute("CREATE TABLE Subcourses ($ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, subcourse TEXT, FOREIGN KEY(name) REFERENCES Courses(name))");

    await db
        .execute("CREATE TABLE Topics ($ID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, subcourse TEXT, topic TEXT, FOREIGN KEY(name) REFERENCES Courses(name))");

    for (int i = 0; i < allCourses.length; i++) {
      await db
          .execute( "INSERT INTO $TABLE ('id', 'name', 'title', 'selected') values (?, ?, ?, ?)", [allCourses[i].id, allCourses[i].name, allCourses[i].title, allCourses[i].selected]);
    }

    print("Courses Created");
    await db
        .execute("CREATE TABLE Users (id INTEGER PRIMARY KEY AUTOINCREMENT, firstName TEXT, lastName TEXT,school TEXt, dept TEXT, level TEXT, username TEXT, role TEXT, password TEXT) ");
    print("user created");
  }

  Future<List> TestPrepList (String course, String SC, String topic, int NofQ, String Type) async {
    var dbClient = await db;
    int er = 0;
    List testList = [];
    List<Map> list = await dbClient.rawQuery('SELECT qnum, course, subCourse, topic, questionType, question, option1, option2, option3, option4, option5, answer1, answer2, answer3, answer4, answer5, picture, contributor, approved, version, category, difficulty FROM $course WHERE subCourse=?', [SC]);
    List<Map> elist = list.toList();
    //if Type is specified, check type here
    if(elist.length > NofQ){
      elist.forEach((element) {
        if(element['topic'] == topic && er <= NofQ){
          testList.add(element);
          er += 1;
        }
      });
    }else{
      elist.forEach((element) {
        if(element['topic'] == topic){
          testList.add(element);
        }
      });
    }
    return testList;
  }

  createTestDB(String dbname) async{
    var dbClient = await db;
    try {
      await dbClient
          .execute(
          "CREATE TABLE $dbname (id INTEGER PRIMARY KEY AUTOINCREMENT, qnum INTEGER, course TEXT, subCourse TEXT, topic TEXT, questionType TEXT, question TEXT, option1 TEXT, option2 TEXT, option3 TEXT, option4 TEXT, option5 TEXT, answer1 TEXT, answer2 TEXT, answer3 TEXT, answer4 TEXT, answer5 TEXT, picture TEXT, contributor TEXT, approved TEXT, version INTEGER, category TEXT, difficulty INTEGER)");
      print("$dbname Created");
    }catch(e){
      print(e);
    }
  }

  addQuestions(String table, quesList) async{
    List addList = await getTableVersion(table, quesList);
    List ques = addList.toList();
    var dbClient = await db;
    try {
      if(ques.length > 0){
        for (int i = 0; i < ques.length; i++) {
          await dbClient
              .execute( "INSERT INTO $table ('qnum', 'course', 'subCourse', 'topic', 'questionType', 'question', 'option1', 'option2', 'option3', 'option4', 'option5', 'answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'picture', 'contributor', 'approved', 'version', 'category', 'difficulty') values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ques[i]['_id'], ques[i]['course'], ques[i]['subCourse'], ques[i]['topic'], ques[i]['questionType'], ques[i]['question'], ques[i]['option1'], ques[i]['option2'], ques[i]['option3'], ques[i]['option4'], ques[i]['option5'], ques[i]['answer1'], ques[i]['answer2'], ques[i]['answer3'], ques[i]['answer4'], ques[i]['answer5'], ques[i]['picture'], ques[i]['contributor'], ques[i]['approved'], ques[i]['version'], ques[i]['category'], ques[i]['difficulty']]);
          /*await dbClient
              .execute( "INSERT INTO $table ('qnum', 'course', 'subCourse', 'topic', 'questionType', 'question', 'option1', 'option2', 'option3', 'option4', 'option5', 'answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'picture', 'contributor', 'approved', 'version', 'category', 'difficulty') values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ques[i]._id, ques[i].course, ques[i].subCourse, ques[i].topic, ques[i].questionType, ques[i].question, ques[i].option1, ques[i].option2, ques[i].option3, ques[i].option4, ques[i].option5, ques[i].answer1, ques[i].answer2, ques[i].answer3, ques[i].answer4, ques[i].answer5, ques[i].picture, ques[i].contributor, ques[i].approved, ques[i].version, ques[i].category, ques[i].difficulty]);
        */
        }
        print("$table Updated");
      }else{
        print("No questions to add");
      }
    }catch(e){
      print(e);
    }
  }

  updateQuestions(String table, List ques ) async {
    var dbClient = await db;
    if(ques.length > 0){
      for(int i = 0; i < ques.length; i++){
        return await dbClient.rawUpdate(
            'UPDATE $table SET course = ?, subCourse = ?, topic = ?, questionType = ?, question = ?, option1 = ?, option2 = ?, option3 = ?, option4 = ?, option5 = ?, answer1 = ?, answer2 = ?, answer3 = ?, answer4 = ?, answer5 = ?, picture = ?, contributor = ?, approved = ?, version = ?, category = ?, difficulty = ? WHERE qnum = ?',
            [ques[i]['course'], ques[i]['subCourse'], ques[i]['topic'], ques[i]['questionType'], ques[i]['question'], ques[i]['option1'], ques[i]['option2'], ques[i]['option3'], ques[i]['option4'], ques[i]['option5'], ques[i]['answer1'], ques[i]['answer2'], ques[i]['answer3'], ques[i]['answer4'], ques[i]['answer5'], ques[i]['picture'], ques[i]['contributor'], ques[i]['approved'], ques[i]['version'], ques[i]['category'], ques[i]['difficulty'], ques[i]['_id']]);
      }
    }else{
      print('No question to update');
    }

  }

  Future<List> getTableVersion(String courseTable, ques) async{ // take db name and question list
    var dbClient = await db;
    List<Map> list = await dbClient.rawQuery('SELECT qnum, version FROM $courseTable'); //get qnum and version
    List<Map> elist = list.toList();
    List<Map> uList = [];
    List list2 = ques.toList();
    try{
      if(elist.length > 0){
        for(int e=0; e<list2.length; e++){
          await elist.forEach((element) {
            if (element['qnum'] == list2[e]["_id"]){
              //print("found it");
              if(list2[e]["version"] > element['version']){ //check version here
                //update list
                uList.add(list2[e]);
                list2.removeAt(e);
              }else{
                list2.removeAt(e);
              }
              //print(list);
              //break;
            }
          });
        }
        //
      }
      print("Add ${list2.length}");
      print("Update ${uList.length}");
      await updateQuestions(courseTable, uList);
    }catch(err){
      print('this error: $err');
    }
    // list should be the next quelist and elist the list of courses qnum and version in db, update list if db containd qnum

    return list2;
  }

  // For subcourse
  Future<List> getSubcourse(String course) async {
    var dbClient = await db;
    List<Map> list = await dbClient.rawQuery('SELECT name, subcourse FROM Subcourses WHERE name=?', [course]); //get qnum and version
    List<Map> elist = list.toList();
    List SC = ['All'];
    elist.forEach((element) {
      SC.add(element['subcourse']);
    });
    return SC;
  }

  Future<List> getSubTable(String course, List subCourseList) async{ // take db name and question list
    var dbClient = await db;
    List<Map> list = await dbClient.rawQuery('SELECT name, subcourse FROM Subcourses WHERE name=?', [course]); //get qnum and version
    List<Map> elist = list.toList();
    //print(elist);
    List list2 = subCourseList.toList();
    try{
      if(elist.length > 0 && list2.length > 0){
        for(int e=0; e<list2.length; e++){
          await elist.forEach((element) {
            //print('db ${element['name'].toString()} web ${list2[e].toString()}');
            if (element['subcourse'].toString() == list2[e].toString()){
              list2.removeAt(e);
            }
          });
        }
      }
      print("Add ${list2.length}");
    }catch(err){
      print('this error: $err');
    }
    return list2;
  }

  addSubs(String course, subsList) async{
    List addList = await getSubTable(course, subsList);
    List ques = addList.toList();
    var dbClient = await db;
    try {
      if(ques.length > 0){
        for (int i = 0; i < ques.length; i++) {
          await dbClient
              .execute( "INSERT INTO Subcourses ('name', 'subcourse') values (?, ?)", [course , ques[i]]);
        }
        print("$course subcourses Updated");
      }else{
        print("No subcoures to add");
      }
    }catch(e){
      print(e);
    }
  }
  // For Topics
  Future<List> getTopics(String course, String subCourse) async {
    var dbClient = await db;
    List<Map> list = await dbClient.rawQuery('SELECT name, subcourse, topic FROM Topics WHERE name=?', [course]); //get qnum and version
    List<Map> elist = list.toList();
    List topics = ['All'];
    elist.forEach((element) {
      if(element['subcourse'] == subCourse){
        topics.add(element['topic']);
      }
    });
    return topics;
  }

  Future<List> getTPTable(String course, String subCourse, List topicsList) async{ // take db name and question list
    var dbClient = await db;
    List<Map> list = await dbClient.rawQuery('SELECT name, subcourse, topic FROM Topics WHERE name=?', [course]); //get qnum and version
    List<Map> elist = list.toList();
    //print(elist);
    List list2 = topicsList.toList();
    try{
      if(elist.length > 0 && list2.length > 0){
        for(int e=0; e<list2.length; e++){
          await elist.forEach((element) {
            //print('db ${element['name'].toString()} web ${list2[e].toString()}');
            if (element['subcourse'].toString() == subCourse){
              if(element['topic'].toString() == list2[e]){
                list2.removeAt(e);
              }
            }
          });
        }
      }
      print("Add ${list2.length}");
    }catch(err){
      print('this error: $err');
    }
    return list2;
  }

  addTP(String course, String subCourse, List topicsList) async{
    List addList = await getTPTable(course, subCourse, topicsList);
    List ques = addList.toList();
    var dbClient = await db;
    try {
      if(ques.length > 0){
        for (int i = 0; i < ques.length; i++) {
          await dbClient
              .execute( "INSERT INTO Topics ('name', 'subcourse', 'topic' ) values (?, ?, ?)", [course , subCourse, ques[i]]);
        }
        print("topics for $subCourse Updated");
      }else{
        print("No topic to update for $subCourse");
      }
    }catch(e){
      print(e);
    }
  }

  Future<Courses> saveCourse(Courses course) async {
    var dbClient = await db;
    course.id = await dbClient.insert(DBHelper.TABLE, course.toMap());
    return course;
    /*
    await dbClient.transaction((txn) async {
      var query = "INSERT INTO $TABLE ($NAME) VALUES ('" + employee.name + "')";
      return await txn.rawInsert(query);
    });
    */
  }

  Future<List<Courses>> getCourses() async {
    var dbClient = await db;
    List<Map> maps = await dbClient.query(DBHelper.TABLE, columns: [DBHelper.ID, DBHelper.NAME, "title", "selected"]);
    //List<Map> maps = await dbClient.rawQuery("SELECT * FROM $TABLE");
    List<Courses> course = [];
    if (maps.length > 0) {
      for (int i = 0; i < maps.length; i++) {
        course.add(Courses.fromMap(maps[i]));
      }
    }
    return course;
  }

  Future<List<Test>> getQuestions(dbname) async {
    var dbClient = await db;
    List<Map> maps = await dbClient.query(dbname, columns: ['qnum', 'course', 'subCourse', 'topic', 'questionType', 'question', 'option1', 'option2', 'option3', 'option4', 'option5', 'answer1', 'answer2', 'answer3', 'answer4', 'answer5', 'picture', 'contributor', 'approved', 'version', 'category', 'difficulty']);
    //List<Map> maps = await dbClient.rawQuery("SELECT * FROM $TABLE");
    //print('getQ $maps number');
    List<Test> question = [];
    if (maps.length > 0) {
      for (int i = 0; i < maps.length; i++) {
        question.add(Test.fromMap(maps[i]));
      }
    }
    return question;
  }

  Future<int> getNumberOfQuestions(List<Test> c) async{
    return c.length;
  }

  Future<List<Courses>> getSelectedCourses() async {
    var dbClient = await db;
    List<Map> maps = await dbClient.query(DBHelper.TABLE, columns: [DBHelper.ID, DBHelper.NAME, "title", "selected"]);
    //List<Map> maps = await dbClient.rawQuery("SELECT * FROM $TABLE");
    List<Courses> course = [];
    if (maps.length > 0) {
      for (int i = 0; i < maps.length; i++) {
        if(Courses.fromMap(maps[i]).selected == "Selected"){
          course.add(Courses.fromMap(maps[i]));
        }
      }
    }
    return course;
  }

  Future<int> deleteCourse(int id) async {
    var dbClient = await db;
    return await dbClient.delete(DBHelper.TABLE, where: '$DBHelper.ID = ?', whereArgs: [id]);
  }

  Future<int> updateCourses(Courses course) async {
    var dbClient = await db;
    return await dbClient.rawUpdate(
        'UPDATE $TABLE SET id = ?, name = ?, title = ?, selected = ? WHERE id = ?',
        [course.id, course.name, course.title, course.selected, course.id]);
    /*return await dbClient.update(DBHelper.TABLE, course.toMap(),
        where: '$DBHelper.ID = ?', whereArgs: [course.id]);*/
  }

  Future close() async {
    var dbClient = await db;
    dbClient.close();
  }
}

class Iavs {
  String name;
  String title;

  Iavs(this.name, this.title);
}