var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";  
  }
  for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
}

function getTopics() {
  var data = {course: $("#course").val(), SubCourse: $("#subcourse").val()};
  $.ajax({
      dataType: "json",
      type: 'post',
      url: '/gettopics',
      data: data,
      
  })
  .done(function(e){
      $.each(e.topics, function(i){
          var x = document.getElementById("topic");
          var c = document.createElement("option");
          c.text = e.topics[i];
          x.options.add(c, (i+1));
      })
  });
}

function getSC() {
  var data = {course: $("#course").val()};
  $.ajax({
      dataType: "json",
      type: 'post',
      url: '/getsc',
      data: data,
      
  })
  .done(function(e){
      //window.reloadTable("sctable");
      $.each(e.sc, function(i){
          var x = document.getElementById("subcourse");
          var c = document.createElement("option");
          c.text = e.sc[i];
          x.options.add(c, (i+1));
      })
  });
}

function approve(a, b) {
  var data = {id: a, course: `${b}`};
  $.ajax({
      dataType: "json",
      type: 'post',
      url: '/appr',
      data: data,
  })
  .done(function(e){
    
  });
}

function deletead(a, b) {
  var data = {id: a, course: `${b}`};
  $.ajax({
      dataType: "json",
      type: 'post',
      url: '/deletead',
      data: data,
  })
  .done(function(e){
    
  });
}

function MaAppr(a, b) {
  var data = {id: a, course: `${b}`, que:$("#que").val(), opt1:$("#opt1").val(), ans1:$("#ans1").val(), opt2:$("#opt2").val(), ans2:$("#ans2").val(), opt3:$("#opt3").val(), ans3:$("#ans3").val(), opt4:$("#opt4").val(), ans4:$("#ans4").val(), opt5:$("#opt5").val(), ans5:$("#ans5").val()};
  $.ajax({
      dataType: "json",
      type: 'post',
      url: '/modify',
      data: data,
  })
  .done(function(e){
    
  });
}