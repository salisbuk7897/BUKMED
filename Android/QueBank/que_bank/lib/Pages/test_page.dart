import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Database/dbhelper.dart';
import 'dart:convert';

class TestPage extends StatefulWidget {
  @override
  _TestPageState createState() => _TestPageState();
}

class _TestPageState extends State<TestPage> {
  Map data = {};
  List questions = [];
  bool checkedValue1 = false;
  bool checkedValue2 = false;
  bool checkedValue3 = false;
  bool checkedValue4 = false;
  bool checkedValue5 = false;
  var correct = 0;
  var wrong = 0;
  bool _isButtonDisabled;
  String ans1;
  String ans2;
  String ans3;
  String ans4;
  String ans5;
  String chkColor1;
  String chkColor2;
  String chkColor3;
  String chkColor4;
  String chkColor5;
  var f = 0;
  var g = 1;

  Color getColor(String vr){
    if(vr == 'red'){
      return Colors.red;
    }else if(vr == 'green'){
      return Colors.green;
    }else{
      return Colors.black;
    }
  }

  String getAnswers(bool q, String a){
    if(q == true && a == 'T'){
      correct += 1;
      return 'green';
    } else if(q == false && a == 'F'){
      correct += 1;
      return 'green';
    }else{
      wrong += 1;
      return 'red';
    }
  }

  getAnswer(List q, List a, List c){
    for(int i=0; i<q.length; i++){
      if(q[i] == true && a[i] == 'T'){
        setState(() {
          c[i] = 'green';
        });

      }else if(q[i] == false && a[i] == 'F'){
        setState(() {
          c[i] = 'green';
        });
      }else{
        setState(() {
          c[i] = 'red';
        });
      }
    }
  }

  getQuestions(String course, String sc, String topic, int qnum, String type) async {
    await DBHelper().TestPrepList(course, sc, topic, qnum, type).then((List SC){
      //print('Preps $preps');
      if(this.mounted){
        setState(() {
          questions = SC;
        });
      }
    });
  }

  @override
  void initState() {
    super.initState();
    _isButtonDisabled = false;
  }

  @override
  Widget build(BuildContext context) {
    data = ModalRoute.of(context).settings.arguments;
    getQuestions(data['course'], data['subcourse'], data['topic'], data['qnum'], data['type']);
    ans1 = questions[f]['answer1'];
    ans2 = questions[f]['answer2'];
    ans3 = questions[f]['answer3'];
    ans4 = questions[f]['answer4'];
    ans5 = questions[f]['answer5'];
    //print('qnum ${data['qnum']}, course ${data['course']}, SC ${data['subcourse']}, topic ${data['topic']}, type ${data['type']}');
    return Scaffold(
      appBar: AppBar(
        title: Text('Test'),
      ),
      body: questions.length > 0 ? SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Center(
          child: Card(
            clipBehavior: Clip.antiAlias,
            child: Column(
              children: <Widget>[
                SizedBox(
                  width: double.infinity,
                  child: Image.asset('assets/phoo.jpeg',
                    height: 150, fit: BoxFit.fitWidth,),
                ),
                ListTile(
                  title: Center(
                    child: Text('Question ${g.toString()}',
                    ),
                  ),
                  subtitle: Text(
                    '${questions[f]['qnum']}. ${questions[f]['question']}',
                    style: TextStyle(color: Colors.black.withOpacity(0.8), fontSize: 18),
                  ),
                ),
                CheckboxListTile(
                  title: Text("${questions[f]['option1']}", style: TextStyle(color: getColor(chkColor1)),),
                  value: checkedValue1,
                  onChanged: (bool newValue) {
                    setState(() {
                      checkedValue1 = newValue;
                      ans1 = questions[f]['answer1'];
                      //print(checkedValue1);
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,  //  <-- leading Checkbox
                ),
                CheckboxListTile(
                  title: Text("${questions[f]['option2']}", style: TextStyle(color: getColor(chkColor2)),),
                  value: checkedValue2,
                  onChanged: (bool newValue) {
                    setState(() {
                      checkedValue2 = newValue;
                      ans2 = questions[f]['answer2'];
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,  //  <-- leading Checkbox
                ),
                CheckboxListTile(
                  title: Text("${questions[f]['option3']}", style: TextStyle(color: getColor(chkColor3)),),
                  value: checkedValue3,
                  onChanged: (bool newValue) {
                    setState(() {
                      checkedValue3 = newValue;
                      ans3 = questions[f]['answer3'];
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,  //  <-- leading Checkbox
                ),
                CheckboxListTile(
                  title: Text("${questions[f]['option4']}", style: TextStyle(color: getColor(chkColor4)),),
                  value: checkedValue4,
                  onChanged: (bool newValue) {
                    setState(() {
                      checkedValue4 = newValue;
                      ans4 = questions[f]['answer4'];
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,  //  <-- leading Checkbox
                ),
                CheckboxListTile(
                  title: Text("${questions[f]['option5']}", style: TextStyle(color: getColor(chkColor5)),),
                  value: checkedValue5,
                  onChanged: (bool newValue) {
                    setState(() {
                      checkedValue5 = newValue;
                      ans5 = questions[f]['answer5'];
                    });
                  },
                  controlAffinity: ListTileControlAffinity.leading,  //  <-- leading Checkbox
                ),
                ButtonBar(
                  alignment: MainAxisAlignment.spaceBetween,
                  children: [
                    RaisedButton(
                      textColor: Color(0xFF6200EE),
                      onPressed:  () {
                        // Perform some action
                        //getAnswer([checkedValue1,checkedValue2,checkedValue3,checkedValue4,checkedValue5], [ans1, ans2, ans3, ans4, ans5], [chkColor1, chkColor2, chkColor3, chkColor4, chkColor5]);
                        _isButtonDisabled ? showDialog(
                          context: context,
                          builder: (context) {
                            return AlertDialog(
                              // Retrieve the text the user has entered by using the
                              // TextEditingController.
                              content: Text('Question Submitted Already'),
                            );
                          },
                        ) :
                        setState(() {
                          chkColor1 = getAnswers(checkedValue1, ans1);
                          chkColor2 = getAnswers(checkedValue2, ans2);
                          chkColor3 = getAnswers(checkedValue3, ans3);
                          chkColor4 = getAnswers(checkedValue4, ans4);
                          chkColor5 = getAnswers(checkedValue5, ans5);
                          _isButtonDisabled = true;
                        });
                      },
                      child: Text('SUBMIT'),
                    ),
                    Column(
                      children: [ g == questions.length ?
                      RaisedButton(
                        textColor: Color(0xFF6200EE),
                        onPressed: () {
                          // Perform some action
                          _isButtonDisabled ?
                          Navigator.pushReplacementNamed(context, '/result', arguments: {
                            'qnum' : questions.length,
                            'correct' : correct,
                            'wrong' : wrong,
                          }) : showDialog(
                            context: context,
                            builder: (context) {
                              return AlertDialog(
                                // Retrieve the text the user has entered by using the
                                // TextEditingController.
                                content: Text('Question has not been Submitted'),
                              );
                            },
                          );
                        },
                        child: Text('FINISH'),
                      ) :
                        RaisedButton(
                          textColor: Color(0xFF6200EE),
                          onPressed: () {
                            // Perform some action
                            _isButtonDisabled ?
                            setState(() {
                              f += 1;
                              g += 1;
                              checkedValue1 = false;
                              checkedValue2 = false;
                              checkedValue3 = false;
                              checkedValue4 = false;
                              checkedValue5 = false;
                              ans1 = '';
                              ans2 = '';
                              ans3 = '';
                              ans4 = '';
                              ans5 = '';
                              chkColor1 = '';
                              chkColor2 = '';
                              chkColor3 = '';
                              chkColor4 = '';
                              chkColor5 = '';
                              _isButtonDisabled = false;
                            }) : showDialog(
                              context: context,
                              builder: (context) {
                                return AlertDialog(
                                  // Retrieve the text the user has entered by using the
                                  // TextEditingController.
                                  content: Text('Question has not been Submitted'),
                                );
                              },
                            );
                          },
                          child: Text('NEXT'),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ) : Center(
          child: Text('No Questions Available',
            style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}
