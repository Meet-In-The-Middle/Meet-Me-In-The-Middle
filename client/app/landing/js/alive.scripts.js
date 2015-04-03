//////////////////////////////////////////////////////  //
//    EVENTS ON PAGE LOADED                             //
//////////////////////////////////////////////////////  //
$(window).load(function() { // makes sure the whole site is loaded
"use strict";

        ///// PRELOADER
        $('#loading').fadeOut(); // will first fade out the loading animation
        $('#preloader').delay(100).fadeOut('slow'); // will fade out the white DIV that covers the website.
        $("body").removeClass("page-loading");
        return false;

});


//////////////////////////////////////////////////////  //
//    EVENTS ON DOCUMENT READY                          //
//////////////////////////////////////////////////////  //
$(document).ready(function(){
"use strict";
  
  ///// CAROUSELS
  
  ////////// TESTIMONIALS
  $("#carousel-testimonials").owlCarousel({
    loop: true,
    nav:true,
    navText: [
      '<div class="elegant arrow_carrot-left"></div>',
      '<div class="elegant arrow_carrot-right"></div>'
      ],
    items: 1
    });

  ////////// LOGOS
  $("#carousel-logos").owlCarousel({
    loop: true,
    nav:false,
    dots: false,
    autoplay:true,
    autoplayTimeout:2500,
    autoplayHoverPause:true,
    items: 4,
    responsiveClass:true,
    responsive:{
        0:{
            items:2,
            nav:true
        },
        480:{
            items:3,
            nav:true
        },
        1000:{
            items:4,
            nav:true,
            loop:false
        }
    }
    });

  ////////// TEAM
  $("#carousel-team").owlCarousel({
    loop: false,
    nav:false,
    items: 6,
    responsiveClass:true,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        240:{
            items:2,
            nav:true
        },
        480:{
            items:3,
            nav:true
        },
        768:{
            items:4,
            nav:true
        },
        1000:{
            items:5,
            nav:true,
            loop:false
        },
        1200:{
            items:6,
            nav:true,
            loop:false
        }
    }
    });

  ////////// GALLERY
  $("#carousel-gallery").owlCarousel({
    loop: true,
    nav:false,
    items: 4,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        350:{
            items:2,
            nav:true
        },
        560:{
            items:3,
            nav:true
        },
        1000:{
            items:4,
            nav:true,
            loop:false
        }
    }
    });

  ////////// FUN FACTS
  $("#carousel-funfacts").owlCarousel({
    loop: false,
    nav:true,
    dots: false,
    navText: [
      '<div class="elegant arrow_carrot-left"></div>',
      '<div class="elegant arrow_carrot-right"></div>'
      ],
    items: 4,
    responsive:{
        0:{
            items:1,
            nav:true
        },
        350:{
            items:2,
            nav:true
        },
        560:{
            items:3,
            nav:true
        },
        1000:{
            items:4,
            nav:true,
            loop:false
        }
    }
    });
  
  ///// SMOOTH SCROLL FIX
  $(function() {
    $('a[href*=#]:not([href=#])').filter(":not(#tabs *)").click(function() {
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
        if (target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top
          }, 1000);
          return false;
        }
      }
    });
  });
  
  ///// BUTTONS DEPRESSED FIX
  $(".btn").mouseup(function(){$(this).blur();});
  $("#navbar .navbar-nav *").mouseup(function(){$(this).blur();});
  
  ///// FUN FACTS COUNTUP
  var options = {
  useEasing : true,
  useGrouping : false,
  separator : ',',
  decimal : '.',
  prefix : '',
  suffix : '' 
  }
  var count01 = new countUp("count01", 0, 65, 0, 3, options);
  var count02 = new countUp("count02", 0, 104, 0, 4, options);
  var count03 = new countUp("count03", 0, 1027, 0, 5, options);
  var count04 = new countUp("count04", 0, 25, 0, 2.5, options);
  
  $('#count01').on('inview', function(event, isInView, visiblePartX, visiblePartY) {if (isInView) {count01.start();} return false;});
  $('#count02').on('inview', function(event, isInView, visiblePartX, visiblePartY) {if (isInView) {count02.start();} return false;});
  $('#count03').on('inview', function(event, isInView, visiblePartX, visiblePartY) {if (isInView) {count03.start();} return false;});
  $('#count04').on('inview', function(event, isInView, visiblePartX, visiblePartY) {if (isInView) {count04.start();} return false;});
  
  ///// COLORBOX GALLERY SETTINGS
  $("#carousel-gallery .gallery-1").colorbox({rel: 'gal', transition:"elastic", opacity: 0.5, scalePhotos: true, maxWidth:'90%', maxHeight:'90%'});
  
  ///// DYNAMIC MODAL CONTENT
  $(function() {
    
    var gotoRegister = $("#gotoRegister");
    var gotoLogin = $("#gotoLogin");
    var gotoRemind = $("#gotoRemind");
    var login = $("#login");
    var remind = $("#remind");
    var register = $("#register");
    
    var clearMe1;
    var clearMe2;
    var clearMe2;
    
    function stopTimer() {
      clearTimeout(clearMe1);
      clearTimeout(clearMe2);
      clearTimeout(clearMe3);
    }
    
    gotoRegister.on("click", function() {  
      login.addClass("noopacity");
      remind.addClass("noopacity");
      
      clearMe1 = setTimeout(function (){
        login.addClass("nodisplay");
        remind.addClass("nodisplay");
        register.removeClass("nodisplay");
        gotoRegister.addClass("noopacity");
      }, 300); // delay
      
      clearMe2 = setTimeout(function (){
        register.removeClass("noopacity");
        gotoRegister.addClass("nodisplay");
        gotoLogin.removeClass("nodisplay");
      }, 350); // delay
      
      clearMe3 = setTimeout(function (){
        gotoLogin.removeClass("noopacity");
      }, 400); // delay
      
      stopTimer();
      
    });
    
   
    gotoLogin.on("click", function() {  
      register.addClass("noopacity");
      remind.addClass("noopacity");
      
      clearMe1 = setTimeout(function (){
        register.addClass("nodisplay");
        remind.addClass("nodisplay");
        login.removeClass("nodisplay");
        gotoLogin.addClass("noopacity");
      }, 300); // delay
      
      clearMe2 = setTimeout(function (){
        login.removeClass("noopacity");
        gotoLogin.addClass("nodisplay");
        gotoRegister.removeClass("nodisplay");
      }, 350); // delay
      
      clearMe3 = setTimeout(function (){
        gotoRegister.removeClass("noopacity");
      }, 400); // delay
      
      stopTimer();
      
    });
    
    
    gotoRemind.on("click", function() {  
      register.addClass("noopacity");
      login.addClass("noopacity");
      
      clearMe1 = setTimeout(function (){
        register.addClass("nodisplay");
        login.addClass("nodisplay");
        remind.removeClass("nodisplay");
        gotoLogin.addClass("noopacity");
      }, 300); // delay
      
      clearMe2 = setTimeout(function (){
        remind.removeClass("noopacity");
        gotoLogin.addClass("nodisplay");
        gotoRegister.removeClass("nodisplay");
      }, 350); // delay
      
      clearMe3 = setTimeout(function (){
        gotoRegister.removeClass("noopacity");
      }, 400); // delay
      
      stopTimer();
      
    });
    
    return false;
    
  });
  
  ///// SEND THE CONTACT FORM
  $("#contact-form").on("submit", function (e) {
      e.preventDefault();
      var name = $("#name").val();
      var email = $("#email").val();
      var phone = $("#phone").val();
      var message = $("#message").val();
      var dataString = 'name=' + name + '&email=' + email + '&subject=' + name + '&phone=' + phone + '&message=' + message;
  
      function isValidEmail(emailAddress) {
          var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
          return pattern.test(emailAddress);
      };
  
      if (isValidEmail(email) && (name.length > 4) && (message.length > 1)) {
          $.ajax({
              type: "POST",
              url: "php/mail.php",
              data: dataString,
              success: function () {
                //if the message was sent...
                //...displays the success message
                $('#FormSuccess').modal();
                //and clears the form inputs
                $("#contact-form").closest('form').find("input[type=text], input[type=tel], input[type=email], textarea").val("");
              }
          });
      } else {
          //if the message was NOT sent...
          //...displays the failure message
          $('#FormFailure').modal();
      }
  
      return false;
  });
  
  ///// SAVE E-MAIL FROM SUBSCRIBE FORM
  $("#subscribe-form").on("submit", function (e) {
      e.preventDefault();
      var subscriber = $("#subscriber").val();
      var dataString = 'subscriber=' + subscriber;
  
      function isValidEmail(emailAddress) {
          var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
          return pattern.test(emailAddress);
      };
  
      if (isValidEmail(subscriber) && (subscriber.length > 4)) {
          $.ajax({
              type: "POST",
              url: "php/subscribe.php",
              data: dataString,
              success: function () {
                //if the message was sent...
                //...displays the success message
                $('#FormSuccess').modal();
                //and clears the form inputs
                $("#subscribe-form").closest('form').find("input[type=email]").val("");
              }
          });
      } else {
          //if the message was NOT sent...
          //...displays the failure message
          $('#FormFailure').modal();
      }
  
      return false;
  });


  
//////////////////////////////////////////////////////  //
//    DOCUMENT READY: EVENTS ON MOBILE                  //
//////////////////////////////////////////////////////  //
  if ($(window).width() < 768) {
    
    ///// DON'T SCROLL ON TABS
    $('#navbar .nav a').filter(":not(#tabs *)").on('click', function(){
      $("#navbar-header .navbar-toggle").on("click");
      return false;
    });
    
  } // EVENTS ON MOBILE ENDS HERE


//////////////////////////////////////////////////////  //
//    DOCUMENT READY: EVENTS ON DESKTOP                 //
//////////////////////////////////////////////////////  // 
  if ($(window).width() > 768) {
    
    ///// SCROLL ANIMATIONS
    $('.anim-from-right').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated fadeInRight');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    
    $('.anim-from-left').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated fadeInLeft');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    
    $('.anim-fade').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated fadeIn');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-fade-down').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated fadeInDown');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-fade-up').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated fadeInUp');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-bounce').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated bounceIn');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-bounce-left').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated bounceInLeft');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-bounce-right').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated bounceInRight');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-bounce-down').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated bounceInDown');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-bounce-up').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated bounceInUp');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-zoom-down').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated zoomInDown');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
    $('.anim-zoom-up').on('inview', function(event, isInView, visiblePartX, visiblePartY) {
      if (isInView) {
        // element is visible in the viewport
        $(this).addClass('animated zoomInUp');
        $(this).css({'opacity' : '1'});
      }
       return false;
    });
    
  } // EVENTS ON DESKTOP ENDS HERE
  
}); // DOCUMENT READY ENDS HERE



