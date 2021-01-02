import 'package:flutter/material.dart';
import 'package:que_bank/Database/dbhelper.dart';

class Home extends StatefulWidget {
  @override
  _HomeState createState() => _HomeState();
}

class _HomeState extends State<Home> {
  var dbHelper;

  @override
  void initState() {
    super.initState();
    dbHelper = DBHelper();
    dbHelper.chk();
    //dbHelper.getIDandVersion();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("QueBank"),
        centerTitle: true,
        elevation: 0,
      ),
      body: Container(
        decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/books.jpg"),
              fit: BoxFit.cover,
            )
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: <Widget>[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                Card(
                  //color: Colors.blue[100],
                  child: InkWell(
                    onTap: (){
                      Navigator.pushNamed(context, "/select_test");
                    },
                    child: Column(
                      children: <Widget> [
                        SizedBox(height: 15.0),
                        Image.asset(
                          "assets/practice.png",
                          height: 150.0,
                          width: 150.0,
                        ),
                        SizedBox(height: 5.0),
                        Center(
                          child: Text(
                              "Practice",
                              style: TextStyle(
                                fontSize: 18.0,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              )),
                        ),
                        SizedBox(height: 5.0),
                      ],
                    ),
                  ),
                ),
                Card(
                  //color: Colors.blue[100],
                  child: InkWell(
                    onTap: (){},
                    child: Column(
                      children: <Widget>[
                        SizedBox(height: 15.0),
                        Image.asset(
                          "assets/Dashboard.png",
                          height: 150.0,
                          width: 150.0,),
                        SizedBox(height: 5.0),
                        Center(
                          child: Text(
                              "DashBoard",
                              style: TextStyle(
                                fontSize: 18.0,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              )),
                        ),
                        SizedBox(height: 5.0),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 10.0),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: <Widget>[
                Card(
                  //color: Colors.blue[100],
                  child: InkWell(
                    onTap: (){},
                    child: Column(
                      children: <Widget> [
                        SizedBox(height: 15.0),
                        Image.asset(
                          "assets/add.png",
                          height: 150.0,
                          width: 150.0,
                        ),
                        SizedBox(height: 5.0),
                        Center(
                          child: Text(
                              "Add Questions",
                              style: TextStyle(
                                fontSize: 18.0,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              )
                          ),
                        ),
                        SizedBox(height: 5.0),
                      ],
                    ),
                  ),
                ),
                Card(
                  //color: Colors.blue[100],
                  child: InkWell(
                    onTap: (){
                      Navigator.pushNamed(context, "/select_courses");
                    },
                    child: Column(
                      children: <Widget>[
                        SizedBox(height: 15.0),
                        Image.asset(
                          "assets/update.png",
                          height: 150.0,
                          width: 150.0,),
                        SizedBox(height: 5.0),
                        Center(
                          child: Text(
                              "Update",
                              style: TextStyle(
                                fontSize: 18.0,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue,
                              ) ),
                        ),
                        SizedBox(height: 5.0),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8.0),
            Center(
              child: Text(
                "(c) BUKMEDS 2021",
                style: TextStyle(
                  fontSize: 18.0,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue,
                ),
              ),
            ),
            SizedBox(height: 8.0)
          ],
        ),
      ),
    );;
  }
}


