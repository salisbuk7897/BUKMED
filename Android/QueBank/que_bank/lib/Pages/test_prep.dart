import 'package:flutter/material.dart';
import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Database/dbhelper.dart';
import 'dart:convert';

class TestPrep extends StatefulWidget {
  @override
  _TestPrepState createState() => _TestPrepState();
}

class _TestPrepState extends State<TestPrep> {
  var dbHelper;
  Map data = {};
  final QuestionsNumber = TextEditingController();
  String scValue = 'All';
  String tpValue = 'All';
  String typeValue = 'MCQ';
  List scList = ['All'];
  List tpList = ['All'];

  List typeList = ['MCQ', 'SCQ'];


  getSCData(ac) async{
    await DBHelper().getSubcourse(ac).then((List SC){
      //print('Preps $preps');
      if(this.mounted){
        setState(() {
          scList = SC;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    data = ModalRoute.of(context).settings.arguments;
    getSCData(data['name']);
    return Scaffold(
      appBar: AppBar(
        title: Text("Test Prep"),
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: <Widget>[
            SizedBox(height: 10,
            ),
            Text('${data['title']} Test', style: TextStyle(fontSize: 30, fontFamily: 'Sans Serif'), ),
            SizedBox(height: 30,
            ),
            Text('Select Sub Course',
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: DropdownButton(
                isExpanded: true,
                value: scValue,
                icon: Icon(Icons.arrow_drop_down),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.red, fontSize: 18),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                items: scList.map<DropdownMenuItem<dynamic>>((dynamic value) {
                  return DropdownMenuItem<dynamic>(
                    value: value,
                    child: Text(value),
                  );
                }).toList() ,
                onChanged: (dynamic datas) async {
                  if(datas == 'All'){
                    //do nothing
                  }else{
                    await DBHelper().getTopics(data['name'], datas).then((List topics){
                      //print('Preps $preps');
                      setState(() {
                        tpValue = 'All';
                        tpList = ['All'];
                        scValue = datas;
                        tpList = topics;
                      });
                    });
                  }
                },
              ),
            ),
            SizedBox(height: 10,
            ),
            Text('Select Topic',
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: DropdownButton(
                isExpanded: true,
                value: tpValue,
                icon: Icon(Icons.arrow_drop_down),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.red, fontSize: 18),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                items: tpList.map<DropdownMenuItem<dynamic>>((dynamic value) {
                  return DropdownMenuItem<dynamic>(
                    value: value,
                    child: Text(value),
                  );
                }).toList() ,
                onChanged: (dynamic data) {
                  setState(() {
                    tpValue = data;
                  });
                },
              ),
            ),
            SizedBox(height: 10,
            ),
            Text('Select Questions Type',
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: DropdownButton(
                isExpanded: true,
                value: typeValue,
                icon: Icon(Icons.arrow_drop_down),
                iconSize: 24,
                elevation: 16,
                style: TextStyle(color: Colors.red, fontSize: 18),
                underline: Container(
                  height: 2,
                  color: Colors.deepPurpleAccent,
                ),
                items: typeList.map<DropdownMenuItem<dynamic>>((dynamic value) {
                  return DropdownMenuItem<dynamic>(
                    value: value,
                    child: Text(value),
                  );
                }).toList() ,
                onChanged: (dynamic datas) async {
                  typeValue = datas;
                },
              ),
            ),
            SizedBox(height: 10,
            ),
            Text('Number of Questions',
              style: TextStyle(
                fontSize: 16,
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: TextFormField(
                  controller: QuestionsNumber,
                  decoration: InputDecoration(
                    labelText: 'Maximum Number possible ${data['Questions']}'
                ),
              ),
            ),
            SizedBox(
              width: double.infinity,
              child: RaisedButton(
                onPressed: (){
                  try{
                    int c = int.parse(QuestionsNumber.text);
                    c > 0 ? Navigator.pushReplacementNamed(context, '/test_page', arguments: {
                      'qnum' : c,
                      'course' : data['name'],
                      'subcourse' : scValue,
                      'topic' : tpValue,
                      'type' : typeValue,
                    }) : showDialog(
                      context: context,
                      builder: (context) {
                        return AlertDialog(
                          // Retrieve the text the user has entered by using the
                          // TextEditingController.
                          content:  Text('Question Number Need to be greater than 0'),
                        );
                      },
                    );
                  }catch(e){
                    return showDialog(
                      context: context,
                      builder: (context) {
                        return AlertDialog(
                          // Retrieve the text the user has entered by using the
                          // TextEditingController.
                          content: Text('Please Enter a Number'),
                        );
                      },
                    );
                  }

                  //Navigator.pushReplacementNamed(context, '/test_page');
                },
                child: Text("Start Test",
                  style: TextStyle(
                    fontSize: 14,
                  ),),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
