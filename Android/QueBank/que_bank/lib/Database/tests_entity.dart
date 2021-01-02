import 'dart:typed_data';

class Test {
  int id;
  int qnum;
  String course;
  String subCourse;
  String topic;
  String questionType;
  String question;
  String option1;
  String option2;
  String option3;
  String option4;
  String option5;
  String answer1;
  String answer2;
  String answer3;
  String answer4;
  String answer5;
  String picture;
  String contributor;
  String approved;
  int version;
  String category;
  int difficulty;

  Test(this.id, this.qnum, this.course, this.subCourse, this.topic, this.questionType, this.question, this.option1, this.option2, this.option3, this.option4, this.option5, this.answer1, this.answer2, this.answer3, this.answer4, this.answer5, this.picture, this.contributor, this.approved, this.version, this.category, this.difficulty);

  Map<String, dynamic> toMap() {
    var map = <String, dynamic>{
      'id': id,
      'qnum': qnum,
      'course': course,
      'subCourse': subCourse,
      'topic': topic,
      'questionType': questionType,
      'question': question,
      'option1': option1,
      'option2': option2,
      'option3': option3,
      'option4': option4,
      'option5': option5,
      'answer1': answer1,
      'answer2': answer2,
      'answer3': answer3,
      'answer4': answer4,
      'answer5': answer5,
      'picture': picture,
      'contributor' : contributor,
      'approved': approved,
      'version' : version,
      'category' : category,
      'difficulty': difficulty,
    };
    return map;
  }

  Test.fromMap(Map<String, dynamic> map) {
    id = map['id'];
    qnum = map['qnum'];
    course = map['course'];
    subCourse = map['subCourse'];
    topic = map['topic'];
    questionType  = map['questionType'];
    question  = map['question'];
    option1  = map['option1'];
    option2 = map['option2'];
    option3 = map['option3'];
    option4 = map['option4'];
    option5 = map['option5'];
    answer1 = map['answer1'];
    answer2 = map['answer2'];
    answer3 = map['answer3'];
    answer4 = map['answer4'];
    answer5 = map['answer5'];
    picture = map['picture'];
    contributor = map['contributor'];
    approved = map['approved'];
    version = map['version'];
    category = map['category'];
    difficulty = map['difficulty'];
  }
}