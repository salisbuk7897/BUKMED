import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:que_bank/Database/Courses_Entity.dart';
import 'package:que_bank/Database/dbhelper.dart';
import 'dart:convert';

class Result extends StatefulWidget {
  @override
  _ResultState createState() => _ResultState();
}

class _ResultState extends State<Result> {
  Map data = {};
  int totalOptions;
  double PM;
  double NM;
  double CS;
  double NS;
  double TS;

  getValues(int a, int c, int w){
    setState(() {
      totalOptions = a * 5;
      PM = 100/totalOptions;
      NM = 0.5 * PM;
      CS = c * PM;
      NS = w * NM;
      TS = CS - NS;
    });


  }

  @override
  Widget build(BuildContext context) {
    data = ModalRoute.of(context).settings.arguments;
    getValues(data['qnum'], data['correct'], data['wrong']);
    return Scaffold(
      appBar: AppBar(
        title: Text("Result"),
      ),
      body: Center(
        child: Column(
          children: [
            SizedBox(
              height: 150,
              child: TS > 50 ? CircleAvatar(
                backgroundImage: AssetImage('assets/pass.png') ,
                radius: 80,
              ) : CircleAvatar(
                backgroundImage: AssetImage('assets/fail.png'),
                radius: 80,
              ) ,
            ),
            Text("Total number of Options", style: TextStyle(fontSize: 20),),
            Text("$totalOptions", style: TextStyle(fontSize: 25),),
            SizedBox(height: 10,),
            Text("Positive Mark", style: TextStyle(fontSize: 20),),
            Text("${PM.toStringAsFixed(1)}", style: TextStyle(fontSize: 25),),
            SizedBox(height: 10,),
            Text("Negative mark", style: TextStyle(fontSize: 20),),
            Text("${NM.toStringAsFixed(1)}", style: TextStyle(fontSize: 25),),
            SizedBox(height: 10,),
            Text("Correct Score", style: TextStyle(fontSize: 20),),
            Text("${CS.toStringAsFixed(1)}", style: TextStyle(fontSize: 25),),
            SizedBox(height: 10,),
            Text("Negative Score", style: TextStyle(fontSize: 20),),
            Text("${NS.toStringAsFixed(1)}", style: TextStyle(fontSize: 25),),
            SizedBox(height: 10,),
            Text("Total Score", style: TextStyle(fontSize: 20),),
            Text("${TS.toStringAsFixed(1)}", style: TextStyle(fontSize: 25),),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: double.infinity,
                child: RaisedButton(
                  onPressed: (){
                    Navigator.pushReplacementNamed(context, '/');
                  },
                  child: Text("Home"),
                ),
              ),
            )

          ],
        ),
      ),
    );
  }
}
