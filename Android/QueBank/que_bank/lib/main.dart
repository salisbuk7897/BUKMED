import 'package:flutter/material.dart';
import 'package:que_bank/Pages/home.dart';
import 'package:que_bank/Pages/result.dart';
import 'package:que_bank/Pages/select_test.dart';
import 'package:que_bank/Pages/select_courses.dart';
import 'package:que_bank/Pages/test_page.dart';
import 'package:que_bank/Pages/test_prep.dart';

void main() {
  runApp(MaterialApp(
    routes: {
      "/": (context) => Home(),
      "/select_test": (context) => SelectPracticeTest(),
      "/select_courses": (context) => SelectCourses(),
      "/test_prep": (context) => TestPrep(),
      "/test_page": (context) => TestPage(),
      "/result": (context) => Result(),
    },
  ));
}

