import 'package:flutter/material.dart';
import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Database/dbhelper.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class SelectCourses extends StatefulWidget {
  @override
  _SelectCoursesState createState() => _SelectCoursesState();
}

class _SelectCoursesState extends State<SelectCourses> {
  List<Courses> courses = [Courses(1, "Loading ....", "Loading...", "Loading......")];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Select Your Course(s)"),
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          verticalDirection: VerticalDirection.down,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Text(
                  "Please Tap on The course(s) of your choice",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            dataTable(courses),
          ],
        ),
      ),
    );
  }

  getCData() async{
    await DBHelper().getCourses().then((List<Courses> coursess){
      //print(coursess);
      setState(() {
        courses = coursess;
      });
    });
  }

  @override
  void initState() {
    super.initState();
    getCData();
  }

  SingleChildScrollView dataTable(List<Courses> course) {
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: DataTable(
        columns: [
          DataColumn(
            label: Text('NAME'),
          ),
          DataColumn(
            label: Text('STATUS'),
          )
        ],
        rows: course
            .map(
              (course) => DataRow(cells: [
            DataCell(
              Text(course.title),
              onTap: () async {
                course.selected = "Selected";
                print(course.toMap());
                await DBHelper().updateCourses(course);
                await DBHelper().createTestDB(course.name);
                getCData();
              },
            ),
            DataCell( course.selected == "Selected" ?
              RaisedButton(onPressed: ()async {
                //TODO Check internet Connection here

                http.Response getSCResponse = await http.get("http://10.0.2.2:2020/update/getsc?course=${course.name}");
                Map jsonResponse = jsonDecode(getSCResponse.body);
                List subCourseList = jsonResponse["subCourse"];
                await DBHelper().addSubs(course.name, subCourseList);
                subCourseList.forEach((element) async {
                  http.Response getTPResponse = await http.get("http://10.0.2.2:2020/update/gettopics?course=${course.name}&subCourse=$element");
                  Map jsonResponse1 = jsonDecode(getTPResponse.body);
                  List tpList = jsonResponse1['topics'];
                  await DBHelper().addTP(course.name, element, tpList);
                });
                http.Response getQueResponse = await http.get("http://10.0.2.2:2020/update/getquestions?course=${course.name}");
                Map jsonResponse2 = jsonDecode(getQueResponse.body);
                List questions = jsonResponse2['data'];
                await DBHelper().addQuestions(course.name, questions);

              }, child: Text('Update')) :
              Text(course.selected),
              onTap: () {},
            ),
          ]),
        ).toList(),
      ),
    );


  }
}
