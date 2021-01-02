import "package:flutter/material.dart";
import 'package:flutter/widgets.dart';
import 'package:que_bank/Database/dbhelper.dart';
import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Services/prepare_test.dart';

class SelectPracticeTest extends StatefulWidget {
  @override
  _SelectPracticeTestState createState() => _SelectPracticeTestState();
}

class _SelectPracticeTestState extends State<SelectPracticeTest> {
  List testName = <String>[];
  var dbHelper;
  List<Prep> prepList = [Prep("ana", "Anatomy", 0)];

  @override
  void initState() {
    super.initState();
    dbHelper = DBHelper();
    getPrepData();
  }

  getPrepData() async{
    await getPrepList().then((List<Prep> preps){
      //print('Preps $preps');
      setState(() {
        prepList = preps;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Select Test"),
      ),
      body: prepList.isNotEmpty ? ListView.builder(
        itemCount: prepList.length,
        itemBuilder : (context, index){
          return Card(
            child: ListTile(
              onTap: () {
                Navigator.pushNamed(context, "/test_prep", arguments: {
                  'name': prepList[index].name,
                  'title': prepList[index].title,
                  'Questions' : prepList[index].question
                });
              },
              title: Text(prepList[index].title),
              subtitle: Text('${prepList[index].question} Questions'),
              leading: CircleAvatar(
                backgroundImage: AssetImage("assets/practice.png"),
              ),
            ),
          );
        },
      ): Padding(
        padding: const EdgeInsets.all(12.0),
        child: Center(
            child: InkWell(
              onTap: (){
                Navigator.pushReplacementNamed(context, "/select_courses");
              },
              child: Text(
                  "No Courses Selected. Click here to go to update and select courses",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16.0,

                ),
              ),
            )
        ),
      )
    );
  }
}
