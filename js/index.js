

//GENERAL
var startscreen="launch"; //for testing web version
var currentpage=""; var referrer="dashboard"; //which page to go back to?
var selectedlang="Djamb"; var selectedgender="All"; var selectedEntry=1; var selectedBodyMap=""; var selectedBodyTitle="";

var audiopathServer="https://yourserver/mp3/v1/";
var audiopath="mp3/"; var audioError=0;
//audiopath=audiopathServer; //comment this in final app
var imagepath="anatomy/";
var imagepathServer="https://yourserver/anatomy/v1/";
//imagepath=imagepathServer; //comment this in final app
var speakers=[]; var topics=[]; var dictionary=[]; 
var malePassword=""; var femalePassword="";


						
//=========================================================================================================================== SHOW STUFF

function showPage(page){
	"use strict";
	currentpage=page; 
	//console.log(currentpage+" referred by: "+referrer);
	$(".screen, .popup, #camera, #alert").css("display","none");
	if (page==="launch"){
		$("#"+page).css("display","flex");
		var startpage="language";
		if (typeof(Storage) !== "undefined") {
			if (localStorage.getItem("ards-lang")!==null){
				selectedlang=localStorage.getItem("ards-lang");
				$("#langmenu .menuBodyItem").css("background", "none");
				$("#lang_"+selectedlang).css("background-color", "#FF4C00");
				startpage="gender";
			} 
			if (localStorage.getItem("ards-gender")!==null){
				selectedgender=localStorage.getItem("ards-gender");
				changeGender(selectedgender);
				startpage="dashboard";
			} 
		}
		setTimeout(function() {
			$("#"+page).fadeOut("slow", function() {
				$("#"+startpage).fadeIn("slow", function() {
				 if (startpage==="language"){playAudio("introduction_languages_M.mp3");}
				if (startpage==="dashboard"){$('img[usemap]').rwdImageMaps();}
				});
				});
		}, 500);
	} else {
		$("#"+page).css("display", "block");
		if (page==="dashboard" || page==="bodyMapHead"){$('img[usemap]').rwdImageMaps();}
	}
}

function showPopup(page){"use strict"; $("#"+page).css("display","flex"); }
function hidePopup(){"use strict"; $("#confirm, .popup, #share").css("display","none");}
function hideAlert(){"use strict"; $("#alert").css("display","none");}
function hideSearch(){"use strict";$("#headerSearchResult").css("display","none");}
function showAlert(message){"use strict"; $("#alertText").html(message); $("#alert").css("display","block");}




//=========================================================================================================================== GET DATA


function getDictionary(){
	"use strict";
	$.getJSON("https://yourserver/entries.php", function(data) {if (data!==0) {dictionary=data;}})
	.done(function() { 
		//console.log("Dictionary: "+JSON.stringify(dictionary));
		initialiseDictionary();
	})
	.fail(function() {console.log("Updated dictionary data could not be retrieved."); initialiseDictionary();});
}

function initialiseDictionary(){
	"use strict";
	getData();
	var preloadHTML="<img src=\"images/audio_on.png\" alt=\"\"><img src=\"images/audio_off.png\" alt=\"\">"; 
	for (var a=0; a<dictionary.length; a++){
		if (dictionary[a].image!==""){
			preloadHTML+="<img id=\"preloadImage"+a+"\" src=\""+imagepath+""+dictionary[a].image+"\" alt=\"\" width=\"0\" height=\"0\">"; 
		}
	}
	$(".preloadContainer").html(preloadHTML);
	if(localStorage.getItem("ards-language")===null){ 
		showPage(startscreen); 
	} else {

	}
}

function getSpeakers(){
	"use strict";
	$.getJSON("https://yourserver/speakers.php", function(data) { if (data!==0) { speakers=data; } })
	.done(function() { 
		//console.log("Speakers: "+JSON.stringify(speakers));
	})
	.fail(function() {console.log("Speakers could not be retrieved.");});
}

function scrollToAnchor(aid){var aTag = $("a[name='"+ aid +"']"); $('#categorylist .screenBody').animate({scrollTop: aTag.offset().top},'slow');}

function getData(){
	"use strict";
	var bodyHTML=""; 
	
	//topics
	var topicsHTML="";
	topicsHTML+="<h2>Diseases</h2>";
	for (var t=0; t<topics.length; t++){
		topicsHTML+='<a name="topic_'+t+'_anchor" id="topic_'+t+'_anchor"></a>';
		topicsHTML+='<div class="topic active" id="topic_'+t+'" onclick="showTopic(\''+t+'\');">';
		topicsHTML+='<div class="entryEnglish">'+topics[t]+'</div>';
		topicsHTML+='<div class="entryYolngu">--</div>';
		topicsHTML+='<div class="clearBoth"></div>';
		topicsHTML+='</div>';
		topicsHTML+='<div class="topicentries" id="topic_'+t+'_entries">';
		topicsHTML+='</div>';
		if (topics[t]==="Lung"){topicsHTML+="<h2>Systems</h2>";}
		//if (topics[t]==="Hormones"){topicsHTML+="<p>&nbsp;</p><h2>Systems</h2>";}
		//if (topics[t]==="Sensory"){topicsHTML+="<p>&nbsp;</p><h2>Multiple languages</h2>";}
	}
	$("#categoryentries").html(topicsHTML); 
	
	
	var listHTML="";
	for (var a=0; a<dictionary.length; a++){
		var sens=dictionary[a].sensitivecontent;
		if (sens==="N" || (selectedgender==="Wom" && (sens==="F"||sens==="B")) || (selectedgender==="Men" && (sens==="M"||sens==="B"))){
			//var engAudioClass=""; var engAudioDivid=""; var engAudioIconid="";
			var yolAudioDivid="";  var yolAudioIconid="";
			var yBMAudioDivid="";  var yBMAudioIconid="";
			var yTPAudioDivid="";  var yTPAudioIconid="";
			var stem = dictionary[a].stem.toLowerCase(); stem=stem.replace(/\s/g,'');
			stem=stem.replace(/\(/g,''); stem=stem.replace(/\)/g,''); 
			var yolngu="--";  var yolngutext=""; var yolnguAudio="Dja";
			
			//checks whether preferred language is available
			var langNotAvail="";
			switch(selectedlang){
				case "Djamb": yolngutext=dictionary[a].dhuwal; break;
				case "Gum": yolngutext=dictionary[a].dhuwala; yolnguAudio="Gum";
					if (yolngutext===""&& dictionary[a].dhuwal!==""){
						yolngutext=dictionary[a].dhuwal; yolnguAudio="Dja";
					} 
					langNotAvail=" langNotAvail"; //set to language not available by default
					for (var b=0; b<dictionary[a].paragraphs.length; b++){
						//if language available remove 'not avilable' class
						if (dictionary[a].paragraphs[b].dhuwala!==""){langNotAvail="";}
					}
					break;
				case "Dha": yolngutext=dictionary[a].dhanu; yolnguAudio="Dha";
					if (yolngutext===""&& dictionary[a].dhuwal!==""){
						yolngutext=dictionary[a].dhuwal; yolnguAudio="Dja"; 
					} 
					langNotAvail=" langNotAvail"; //set to language not available by default
					for (var c=0; c<dictionary[a].paragraphs.length; c++){
						//if language available remove 'not avilable' class
						if (dictionary[a].paragraphs[c].dhanu!==""){langNotAvail="";}
					}
					break;
			}
			if (yolngutext!==""){yolngu=yolngutext;}
			
			//create list all
			yolAudioDivid=' id="list_AudioDiv_'+yolnguAudio+'_'+stem+'_0" onclick="toggleAudio(\'list_AudioDiv_'+yolnguAudio+'_'+stem+'_0\');"'; 
			yolAudioIconid=' id="list_AudioIcon_'+yolnguAudio+'_'+stem+'_0"';
			
			listHTML+='<div class="entry'+langNotAvail+'">';
			listHTML+='<div class="entryEnglish" onclick="setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');">'+dictionary[a].stem+'</div>';
			listHTML+='<div class="entryYolngu audioButtonDiv active"'+yolAudioDivid+'><img src="images/audio_on.png" alt="play" title="Play" class="audioIcon"'+yolAudioIconid+'> '+yolngu+' </div>';
			listHTML+='<div class="entryGo active" onclick="setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');"><i class="fas fa-caret-right"></i></div>';
			listHTML+='<div class="clearBoth"></div>';
			listHTML+='</div>';
			if (selectedBodyMap===dictionary[a].location){
				//create body map
				yBMAudioDivid=' id="body_AudioDiv_'+yolnguAudio+'_'+stem+'_0" onclick="toggleAudio(\'body_AudioDiv_'+yolnguAudio+'_'+stem+'_0\');"'; 
				yBMAudioIconid=' id="body_AudioIcon_'+yolnguAudio+'_'+stem+'_0"';

				bodyHTML+='<div class="entry">';
				bodyHTML+='<div class="entryEnglish" onclick="referrer=\'bodyMapContent\'; setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');">'+dictionary[a].stem+'</div>';
				bodyHTML+='<div class="entryYolngu audioButtonDiv active"'+yBMAudioDivid+'><img src="images/audio_on.png" alt="play" title="Play" class="audioIcon"'+yBMAudioIconid+'> '+yolngu+' </div>';
				bodyHTML+='<div class="entryGo active" onclick="referrer=\'bodyMapContent\'; setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');"><i class="fas fa-caret-right"></i></div>';
				bodyHTML+='<div class="clearBoth"></div>';
				bodyHTML+='</div>';
			}
			
			//create category list
			yTPAudioDivid=' id="topicAudioDiv_'+yolnguAudio+'_'+stem+'_0" onclick="toggleAudio(\'topicAudioDiv_'+yolnguAudio+'_'+stem+'_0\');"'; 
			yTPAudioIconid=' id="topicAudioIcon_'+yolnguAudio+'_'+stem+'_0"';
			var tempTopicHTML="";
			tempTopicHTML+='<div class="entry'+langNotAvail+'">';
			tempTopicHTML+='<div class="entryEnglish" onclick="referrer=\'categorylist\'; setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');">'+dictionary[a].stem+'</div>';
			tempTopicHTML+='<div class="entryYolngu audioButtonDiv active"'+yTPAudioDivid+'><img src="images/audio_on.png" alt="play" title="Play" class="audioIcon"'+yTPAudioIconid+'> '+yolngu+' </div>';
			tempTopicHTML+='<div class="entryGo active" onclick="referrer=\'categorylist\'; setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');"><i class="fas fa-caret-right"></i></div>';
			tempTopicHTML+='<div class="clearBoth"></div>';
			tempTopicHTML+='</div>';			
			for (var tt=0; tt<topics.length; tt++){
				if (dictionary[a].topics.toLowerCase().indexOf(topics[tt].toLowerCase())!==-1){
					$("#topic_"+tt+"_entries").append(tempTopicHTML); 
				}
				//if (topics[tt]==="Dhaŋu entries"||topics[tt]==="Dhuwala entries"){
					
				//}
			}
		}
	}
	for (var ttt=0; ttt<topics.length; ttt++){
		if ($("#topic_"+ttt+"_entries").html()===""){$("#topic_"+ttt+"_entries").html("<p>No matches found in the current dictionary. Change the dictionary settings in the top left menu if you’re looking for sensitive terms.</p>"); }		
	}
	if (listHTML===""){listHTML="<p>No entries could be retrieved.</p>";}
	listHTML+="<p class='noteBottom'>Change dictionary settings in the top left menu to see male or female-specific entries. </p><p class='noteBottom'>Bulu dhäwu ŋunhi miyalkku ga ḏirramuw pat ga ŋura</p>";
	if (bodyHTML===""){bodyHTML="<p>No entries could be retrieved.</p>";}
	$("#fulllist .entries").html(listHTML); 
	$("#bodyMapContent .bodymapentries").html(bodyHTML);
	
}



function setEntry(x){
	"use strict";
	selectedEntry=parseInt(x);

	if ($("#bodyMapContent").css("display")==="block"){referrer="bodyMapContent";}
	if ($("#bodyMapContentTemp").css("display")==="block"){referrer="bodyMapContentTemp";}
	//get right id from dictionary
	var n=-1; for (var a=0; a<dictionary.length; a++){if(dictionary[a].id === x.toString()){n = a;}}
	//console.log(JSON.stringify(dictionary[n]));
	var stem=dictionary[n].stem; var stemLC=stem.toLowerCase(); stemLC=stemLC.replace(/\s/g,''); 
	stemLC=stemLC.replace(/\(/g,''); stemLC=stemLC.replace(/\)/g,'');  
	var str=''; var str2="";  $("#dictionaryentry").html(); $("#dictionaryheadentry").html();
	
	//this is so that if there are no entries for Gum or Dha it shows the Djamb text and audio
	var yolngu="--"; var yolngutext=""; var yolnguAudio="Dja"; 
	
	switch(selectedlang){
		case "Djamb": yolngutext=dictionary[n].dhuwal; break;
		case "Gum": yolngutext=dictionary[n].dhuwala; yolnguAudio="Gum";
			if (yolngutext===""&& dictionary[n].dhuwal!==""){
				yolngutext=dictionary[n].dhuwal; yolnguAudio="Dja"; 
			} break;
		case "Dha": yolngutext=dictionary[n].dhanu; yolnguAudio="Dha";
			if (yolngutext===""&& dictionary[n].dhuwal!==""){
				yolngutext=dictionary[n].dhuwal; yolnguAudio="Dja"; 
			} break;
	}
	if (yolngutext!==""){yolngu=yolngutext;}
			
	
	//writes the header of the entry
	str2+='<div class="headerEnglish id="entryAudioDiv_Eng_'+stemLC+'_0">'+dictionary[n].english+'</div>';
	str2+='<div class="headerYolngu audioButtonDiv active" id="entryAudioDiv_'+yolnguAudio+'_'+stemLC+'_0" onclick="toggleAudio(\'entryAudioDiv_'+yolnguAudio+'_'+stemLC+'_0\');"><img src="images/audio_on.png" alt="play" title="Play" class="audioIcon" id="entryAudioIcon_'+yolnguAudio+'_'+stemLC+'_0"> '+yolngu+'</div>';
	
	$("#dictionaryheadentry").html(str2);
	
	//writes the image for the entry
	var backgroundColorStyle="";
	var imageFilePath="";
	if (dictionary[n].image!==""){
		imageFilePath=imagepath+dictionary[n].image;
		str+='<div class="anatomyImageDiv" data-img="'+imageFilePath+'" onclick="enlargeImage();"><img src="'+imageFilePath+'" alt="" class="anatomyImage"></div>';
		backgroundColorStyle=" whiteBg";
	} else {
		str+='<div class="marginTop">&nbsp;</div>';
		backgroundColorStyle=" noBg";
	}
	
	//writes the tabs (anatomy etc) for however many paragraphs there are
	str+='<div class="entryCatHolder '+backgroundColorStyle+'">';
	var numtabs=dictionary[n].paragraphs.length;
	if (numtabs>1){
		var colW="col3";  //if (numtabs===2){colW="col2";}
		for (var d=0; d<numtabs; d++){
			switch(dictionary[n].paragraphs[d].category){
				case "2": str+='<div class="entryCat '+colW+' backgroundAnatomy" id="entryCat'+(d+1)+'" onclick="showPara('+(d+1)+');"><div class="entryCatContainer"><img src="images/icon-anatomy.png" title="Anatomy" alt="Anatomy"></div></div>'; break;
				case "3": str+='<div class="entryCat '+colW+' backgroundPathology" id="entryCat'+(d+1)+'" onclick="showPara('+(d+1)+');"><div class="entryCatContainer"><img src="images/icon-pathology.png" title="Pathology" alt="Pathology"></div></div>'; break;
				case "4": str+='<div class="entryCat '+colW+' backgroundProcedure" id="entryCat'+(d+1)+'"  onclick="showPara('+(d+1)+');"><div class="entryCatContainer"><img src="images/icon-procedure.png" title="Procedure" alt="Procedure"></div></div>'; break;
			}
		}
	}
	str+='<div class="clearBoth"></div>';
	str+='</div>';
	
	//writes the para blocks 
	for (var b=0; b<dictionary[n].paragraphs.length; b++){
		
		//this is so that if there are no entries for Gum or Dha it shows the Djamb text and audio
		var yolngupara="--"; 
		var yolngutextpara=""; var yolnguAudiopara="Dja"; var yolnguSpeaker="";
		//in case preferred language is not available
		var prefLang=true; 
		switch(selectedlang){
			case "Djamb": yolngutextpara=dictionary[n].paragraphs[b].dhuwal; yolnguSpeaker=dictionary[n].paragraphs[b].dhuwalspeaker; break;
			case "Gum": 
				yolngutextpara=dictionary[n].paragraphs[b].dhuwala; yolnguAudiopara="Gum";
				yolnguSpeaker=dictionary[n].paragraphs[b].dhuwalaspeaker;
				if (yolngutextpara===""&& dictionary[n].paragraphs[b].dhuwal!==""){
				yolngutextpara=dictionary[n].paragraphs[b].dhuwal; yolnguAudiopara="Dja";
				yolnguSpeaker=dictionary[n].paragraphs[b].dhuwalspeaker; prefLang=false;
				} break;
			case "Dha": 
				yolngutextpara=dictionary[n].paragraphs[b].dhanu; yolnguAudiopara="Dha";
				yolnguSpeaker=dictionary[n].paragraphs[b].dhanuspeaker;
				if (yolngutextpara===""&& dictionary[n].paragraphs[b].dhuwal!==""){
				yolngutextpara=dictionary[n].paragraphs[b].dhuwal; yolnguAudiopara="Dja";
				yolnguSpeaker=dictionary[n].paragraphs[b].dhuwalspeaker; prefLang=false;
				} break;
		}
		if (yolngutextpara!==""){yolngupara=yolngutextpara;}
			
		//writes the para blocks 
		var c=b+1;
		var paraentryid="paraentry"+(b+1); var paraentryclass="entryAnatomy";
		switch(dictionary[n].paragraphs[b].category){
			case "3": paraentryclass="entryPathology"; break;
			case "4": paraentryclass="entryProcedure"; break;
		}
		var parahide=" invisible"; if (b===0){parahide="";} //(only shows the first para)
		str+='<div class="paraentry entry '+paraentryclass+parahide+'" id="'+paraentryid+'">';
		//writes the english side of the para
		str+='<div class="entryEnglish">';
			str+='<div class="" id="entryAudioDiv_Eng_'+stemLC+'_'+c+'">'+dictionary[n].paragraphs[b].english+'</div>';
		str+='</div>';
		//writes the yolngu side
		str+='<div class="entryYolngu">';
		//tells user that their language is not available for this entry
		if (prefLang===false){
			str+='<div class="headerPrefLang">Sorry, only Dhuwal language available for this entry.</div>';
		}
		str+='<div class="audioButtonDiv active" id="entryAudioDiv_'+yolnguAudiopara+'_'+stemLC+'_'+c+'" onclick="toggleAudio(\'entryAudioDiv_'+yolnguAudiopara+'_'+stemLC+'_'+(b+1)+'\');"><img src="images/audio_on.png" alt="play" title="Play" class="audioIcon" id="entryAudioIcon_'+yolnguAudiopara+'_'+stemLC+'_'+c+'"> '+yolngupara+'</div>';
		//writes the speaker link
		if (yolnguSpeaker!=="0"){
			str+='<div class="speakerDiv"><a href="#" onclick="showSpeaker(\''+yolnguSpeaker+'\'); return false;">'+speakers[parseInt(yolnguSpeaker-1)].name+'</a> <i class="fas fa-user"></i></div>';
		}
		
		str+='</div><div class="clearBoth"></div>';
		str+='</div>';
	}
	
	//console.log(str);
	
	//need to edit - show similar entries
	//str+='<p>See also: <u>Abdomen</u>, <u>Bile</u>, <u>Sclera</u></p>';
	
	$("#dictionaryentry").html(str);
	
	if (imageFilePath!==""){
		$.get(imageFilePath) //check image exists
    	.fail(function() { 
			//if image doesn't exist on the phone, check on the server for updates
       		imageFilePath=imagepathServer+dictionary[n].image;
			$("#dictionaryentry .anatomyImageDiv").data("img",imageFilePath);
			$("#dictionaryentry .anatomyImage").attr("src", imageFilePath);
    	});
		
	}
	
}

function enlargeImage(){
	"use strict";
	$("#imageEnlarge").attr("src", $(".anatomyImageDiv").data("img")); 
	showPopup("image"); 	
}

function showPara(id){
	"use strict";
	$(".paraentry").css("display", "none"); 
	$("#paraentry"+id).css("display", "block");
	$(".entryCat").css("opacity", "1");
	$(".entryCat").css("opacity", "0.7");
$("#entryCat"+id).css("opacity", "1");
}
	

function showSpeaker(id){
	"use strict";
	var a=parseInt(id)-1;
	var str="<h2>"+speakers[a].name+"</h2>";
	str+="<p><strong>Job/Djäma:</strong> "+speakers[a].job+"</p>";
	str+="<p><strong>Clan/Bäpurru:</strong> "+speakers[a].tribe+"</p>";
	str+="<p><strong>Homeland/Yirralka:</strong> "+speakers[a].country+"</p>";
	showAlert(str);
}


function changeLang(lang){
	"use strict";
	selectedlang=lang; var langstr="";
	//if (typeof(Storage) !== "undefined") {localStorage.setItem("ards-lang", lang);} 
	$("#langmenu .menuBodyItem").css("background", "none");
	$("#language .langButton").css("background-color", "#FFF");
	$("#lang_"+lang+", #lan2_"+lang).css("background-color", "#FF4C00");
	switch(lang){
		case "Djamb": langstr="Dhuwal"; break;
		case "Gum": langstr="Dhuwala";  break;
		case "Dha": langstr="Dhaŋu"; break;
	}
	$(".langname, .langFlag").html(langstr);
	getData();
	setEntry(selectedEntry);
	setTimeout(function() {$(".popup").fadeOut("slow");}, 500);
	//hidePopup();
}


function changeGender(gender){
	"use strict";
	selectedgender=gender; var genderstr="";
	//if (typeof(Storage) !== "undefined") {localStorage.setItem("ards-gender", gender);} 
	setTimeout(function() {$(".menuBodyItemCode").slideUp();}, 500);
	$("#menu .menuBodyItem2").css("background", "none");
	$("#gender .genderButton").css("background-color", "#FFF");
	$("#gend_"+gender+", #gen2_"+gender).css("background-color", "#FF4C00");
	//change icons in gender menu
	$("#gend_All .menuBodyItemIcon").attr("src", "images/icon-body-off.png");
	$("#gend_Men .menuBodyItemIcon").attr("src", "images/icon-body-male-off.png");
	$("#gend_Wom .menuBodyItemIcon").attr("src", "images/icon-body-female-off.png");
	switch(gender){
		case "All": genderstr="For everybody"; switchBody("both"); break;
		case "Men": genderstr="For men only";  switchBody("men"); break;
		case "Wom": genderstr="For women only"; switchBody("women");   break;
	}
	$(".gendername").html(genderstr);
	
	getData();
	setEntry(selectedEntry);
	if (currentpage==="gender" || currentpage==="launch"){
		setTimeout(function() {showPage("dashboard");}, 500);
	} else {
		setTimeout(function() {$(".popup").fadeOut("slow");}, 300);
	}
}



function authoriseGender(gender){
	"use strict";
	var error = "<p>Your password is not right.</p><p>Please contact ARDS at feedback@ards.com.au or on <a href='tel:0889844174'>(08) 8984 4174</a> for the password.</p>";
	if(gender==="male"){
		if ($("#maleCode2").val().toLowerCase()===malePassword.toLowerCase() || $("#maleCode").val().toLowerCase()===malePassword.toLowerCase()){
			changeGender("Men");
		} else {
			showAlert(error);
		}
	} else {
		if ($("#femaleCode2").val().toLowerCase()===femalePassword.toLowerCase() || $("#femaleCode").val().toLowerCase()===femalePassword.toLowerCase()){
			changeGender("Wom");
		} else {
			showAlert(error);
		}
	}
	
}




//=========================================================================================================================== SEARCH

function searchDictionary(word){
	"use strict";
	var resultHTML="";
	var results=[]; var resultEnglish=""; var resultYolngu="";
	var count=0; var limit=5;
	var needle = word.toLowerCase(); var length=needle.length; 
	var haystack;
	
	//first search start of stems (english)
	for (var d=0; d<dictionary.length; d++){
		if (count<limit){
			var sens=dictionary[d].sensitivecontent;
			if (sens==="N" || (selectedgender==="Wom" && (sens==="F"||sens==="B")) || (selectedgender==="Men" && (sens==="M"||sens==="B"))){
				// needle = word.toLowerCase(); needle=needle.replace(/\s/g,'');
				// haystack = dictionary[d].stem.toLowerCase(); haystack=haystack.replace(/\s/g,'');
				haystack = dictionary[d].stem.toLowerCase(); haystack=haystack.substring(0,length);
				//console.log(needle+" "+haystack);
				if (needle===haystack){
					if ($.inArray(d,results)===-1){
						results.push(d);
						count++;
					}
				}
			}
		}
	}
	
	//search yolngu words
	for (var f=0; f<dictionary.length; f++){
		if (count<limit){
			var sens1=dictionary[f].sensitivecontent;
			if (sens1==="N" || (selectedgender==="Wom" && (sens1==="F"||sens1==="B")) || (selectedgender==="Men" && (sens1==="M"||sens1==="B"))){
				var haystack1=dictionary[f].dhuwal.toLowerCase(); //haystack1=haystack1.substring(0,length);
				var haystack2=dictionary[f].dhuwala.toLowerCase(); //haystack2=haystack2.substring(0,length);
				var haystack3=dictionary[f].dhanu.toLowerCase(); //haystack3=haystack3.substring(0,length);
				if (haystack1.indexOf(needle)!==-1 || haystack2.indexOf(needle)!==-1 || haystack3.indexOf(needle)!==-1){
					if ($.inArray(f,results)===-1){
						results.push(f);
						count++;
					}
				}
			}
		}
	}
	
	//search keywords
	for (var e=0; e<dictionary.length; e++){
		if (count<limit){
			var sens2=dictionary[e].sensitivecontent;
			if (sens2==="N" || (selectedgender==="Wom" && (sens2==="F"||sens2==="B")) || (selectedgender==="Men" && (sens2==="M"||sens2==="B"))){
				
				var keywordarray=dictionary[e].tags.split(",");
				//console.log(e+" - "+dictionary[e].english+" - "+keywordarray);
				
				for (var k=0; k<keywordarray.length; k++){
					haystack = keywordarray[k].toLowerCase(); 
					haystack=haystack.replace(/\s/g,'');  needle = needle.replace(/\s/g,'');
					haystack=haystack.substring(0,needle.length);
					//if (e===97&&k===4){console.log(needle+" "+haystack);}
					if (needle===haystack){
						//if (e===97){console.log(needle+" "+haystack);}
						var sens3=dictionary[e].sensitivecontent;
						if ($.inArray(e,results)===-1 && (sens3==="N" || (selectedgender==="Wom" && (sens3==="F"||sens3==="B")) || (selectedgender==="Men" && (sens3==="M"||sens3==="B")))){
							//if (e===100 &&k===3){console.log(k);}
							results.push(e);
							count++;
						}
					}
				}
				
			}
		}
	}
	
	
	
	if (count>0){
		for (var r=0; r<results.length; r++){
			var a=parseInt(results[r]);
			var stem = dictionary[a].stem.toLowerCase(); stem=stem.replace(/\s/g,'');
			var yolngu="--"; 
			var yolngutext="";
			switch(selectedlang){
			case "Djamb": yolngutext=dictionary[a].dhuwal; break;
			case "Gum": yolngutext=dictionary[a].dhuwala; 
				if (yolngutext===""&& dictionary[a].dhuwal!==""){
					yolngutext=dictionary[a].dhuwal; 
				} break;
			case "Dha": yolngutext=dictionary[a].dhanu; 
				if (yolngutext===""&& dictionary[a].dhuwal!==""){
					yolngutext=dictionary[a].dhuwal; 
				} break;
			}
			if (yolngutext!==""){yolngu=yolngutext;}
			var yolS=yolngu.toLowerCase().indexOf(needle); resultYolngu="";
			if (yolS!==-1){ //make the search phrase bold if it's in the yolngu word
				resultYolngu=yolngu.substr(0,yolS)+"<strong>"+needle+"</strong>"+yolngu.substring((yolS+length));
			} else {
				resultYolngu=yolngu;
			}

			var engS=dictionary[a].stem.toLowerCase().indexOf(needle); 
			resultEnglish=dictionary[a].stem;
			if (engS!==-1){ //make the search phrase bold if it's in the English word
				var boldNeedle="";
				if (engS===0){boldNeedle = needle.charAt(0).toUpperCase() + needle.slice(1);} //capitalise first letter of search term
				resultEnglish=resultEnglish.substr(0,engS)+"<strong>"+boldNeedle+"</strong>"+resultEnglish.substring((engS+length));
			} 
			
			
			resultHTML+='<div class="entry searchresult active" onclick="setEntry(\''+dictionary[a].id+'\'); showPage(\'entry\');"><div class="entryEnglish">'+resultEnglish+'</div><div class="entryYolngu">'+resultYolngu+'</div><div class="clearBoth"></div></div>';
		}
	}
	
	
	if (resultHTML===""){resultHTML="<p>No matches found in the current dictionary.</p><p>Change the dictionary settings in the top left menu if you're looking for sensitive terms.</p>";}
	//console.log(resultHTML);
	$("#searchresults").html(resultHTML);
	$("#headerSearchResult").css("display","block"); 
}
		
//=========================================================================================================================== BODY MAP
function showBody(){
	"use strict";
	referrer='dashboard';
	if (currentpage==="dashboard"){
		//go to change gender menu
		showPopup("menu");
	} else{
		$(".headerSubmenu").css("background","none");
		$(".headerPictureSearch").css("background-color","#FF4C00");
		showPage("dashboard");
	}
}

	

function setBody(a){
	"use strict";
	selectedBodyMap=a; 
	if (a==='0'){
		showPage("bodyMapHead");
	} else {
		switch (a){
			case '1': referrer="bodyMapHead"; selectedBodyTitle="Nose"; break; //nose
			case '2': referrer="bodyMapHead"; selectedBodyTitle="Eye"; break; //eye
			case '3': referrer="bodyMapHead"; selectedBodyTitle="Ear"; break; //ear
			case '4': referrer="bodyMapHead"; selectedBodyTitle="Mouth"; break; //mouth
			case '5': referrer="bodyMapHead"; selectedBodyTitle="Neck"; break; //neck
			case '6': referrer="bodyMapHead"; selectedBodyTitle="Face"; break; //face
			case '7': referrer="bodyMapHead"; selectedBodyTitle="Brain"; break; //brain
				
			case '8': referrer="dashboard"; selectedBodyTitle="Lower torso"; break; 
			case '9': referrer="dashboard"; selectedBodyTitle="Middle torso"; break; 
			case '10': referrer="dashboard"; selectedBodyTitle="Upper torso"; break; 
			case '11': referrer="dashboard"; selectedBodyTitle="Foot"; break; 
			case '12': referrer="dashboard"; selectedBodyTitle="Leg"; break; 
			case '13': referrer="dashboard"; selectedBodyTitle="Arm"; break; 
			case '14': referrer="dashboard"; selectedBodyTitle="Hand"; break; 
		}
			
		$("#bodyMapContent h2").html(selectedBodyTitle);
		getData();
		showPage("bodyMapContent");
	}	
}

function setHeadImage(gender){
	"use strict";
	if (gender==="female"){
		$("#headMapImageDiv").attr("src", "images/head-outline-female.png");
	} else{
		$("#headMapImageDiv").attr("src", "images/head-outline-male.png");
	}
}

function switchBody(gender){
	"use strict";
	if (gender==="men"){
		//$("#bodyMapImageDiv").attr("src", "images/body-outline-male.png");
		setHeadImage("male");
		$("#bodyMapMale").css("display", "block"); $("#bodyMapFemale").css("display", "none"); $("#bodyMapBoth").css("display", "none");
		$("#gen2_Men").css("background-image", "url('images/icon-body-male.png')");
		$("#gend_Men .menuBodyItemIcon, .headerPictureSearch img").attr("src", "images/icon-body-male.png");
		
	} else if (gender==="women"){
		//$("#bodyMapImageDiv").attr("src", "images/body-outline-female.png");
		setHeadImage("female");
		$("#bodyMapFemale").css("display", "block"); $("#bodyMapMale").css("display", "none"); $("#bodyMapBoth").css("display", "none");
		$("#gen2_Wom").css("background-image", "url('images/icon-body-female.png')");
		$("#gend_Wom .menuBodyItemIcon, .headerPictureSearch img").attr("src", "images/icon-body-female.png");
		
	} else{
		//$("#bodyMapImageDiv").attr("src", "images/body-outline-both.png");
		setHeadImage("male");
		$("#bodyMapBoth").css("display", "block"); $("#bodyMapFemale").css("display", "none"); $("#bodyMapMale").css("display", "none");
		$("#gen2_All").css("background-image", "url('images/icon-body.png')");
		$("#gend_All .menuBodyItemIcon, .headerPictureSearch img").attr("src", "images/icon-body.png");
	}
	$('img[usemap]').rwdImageMaps();
}

//=========================================================================================================================== LIST ALL
function showFull(){
	"use strict";
	referrer='fulllist';
	showPage("fulllist");
	$(".headerSubmenu").css("background","none");
	$(".headerListSearch").css("background-color","#FF4C00");
}

//=========================================================================================================================== LIST CATEGORIES
function showCategory(){
	"use strict";
	referrer='categorylist';
	showPage("categorylist");
	$(".headerSubmenu").css("background","none");
	$(".headerCategorySearch").css("background-color","#FF4C00");
}

function showTopic(name){
	"use strict";
	if ($("#topic_"+name+"_entries").css("display")==="none"){
		$(".topicentries").css("display", "none");
		$(".topic").css({"background-color":"#ffffffab", "color":"#000"});
		$("#topic_"+name).css({"background-color":"#ffb91a", "color":"#000"});
		$("#topic_"+name+"_entries").slideDown("fast");
		var num=parseInt(name); if (num>5){scrollToAnchor("topic_"+(num-1)+"_anchor");} 
	} else {
		$(".topicentries").css("display", "none");
		$(".topic").css({"background-color":"#ffffffab", "color":"#000"});
	}
	
	
}


//=========================================================================================================================== BACK BUTTON ON ANDROID
function onBackKeyDown() {
	"use strict";
    hidePopup();
	$('input').blur();
	switch (currentpage){
		case "planetcareplan": $("#planetaboutTextDiv").css("display", "none"); showPage("dashboard"); break;
			
	}
}

//======================================================================================================================= AUDIO PLAYER
function toggleAudio(id){
	"use strict";
	
	if ($("#"+id+" .audioIcon").attr("src")==="images/audio_on.png") {
		//play audio
		var filename=id.substr(14); 
		var lang=filename.substr(0,3);
		if (lang==="Dja"){ filename="Djamb"+filename.substr(3);} //set filename to selected lang
		if (lang==="Gum" || lang==="Dha"){ filename=selectedlang+filename.substr(3);} //set filename to selected lang
		filename+="_M.mp3";
		$(".audioIcon").attr("src","images/audio_on.png");
		$("#"+id+" .audioIcon").attr("src","images/audio_off.png"); 
		playAudio(filename);
	} else {
		$(".audioIcon").attr("src","images/audio_on.png");
		audioOff();
	}
}
	
function checkLoadedAudio(){
	"use strict";
	var audio = document.getElementById('audioPlayer');
	audio.play();
	audioError=0;
	console.log("audio loaded "+$("#audioPlayer").attr("src"));
}

function playAudio(filename) { 
	"use strict";
	if (filename.indexOf("upper_")!==-1){
		var array1=filename.split("upper");
		filename=array1[0]+"(upper)"+array1[1];
	}
	if (filename.indexOf("lower_")!==-1){
		var array2=filename.split("lower");
		filename=array2[0]+"(lower)"+array2[1];
	}
	filename=audiopath+filename;
	//console.log(audioError);
	var audio = document.getElementById('audioPlayer');
	audio.setAttribute("src", filename);
	audio.load();
 }


   
function audioOff(){
	"use strict";
	var audio = document.getElementById('audioPlayer');
	audio.pause();
}
	
				
//=========================================================================================================================== INITIALISE APP


var app = {
    initialize: function() {
		"use strict";
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

   onDeviceReady: function() {
	   "use strict";
        this.receivedEvent('deviceready');
    },

    receivedEvent: function(id) {
		"use strict";
		$(".listening").css("display","none");
		$(".received").css("display","block");
        /*Put all plugin related calls in here*/
       
		//access the text zoom set in phone and scale web view accordingly
		MobileAccessibility.usePreferredTextZoom(true);
		//function getTextZoomCallback(textZoom) {}
		//MobileAccessibility.getTextZoom(getTextZoomCallback);
		
		/*Development key hash = ga0RGNYHvNM5d0SLGQfpQWAPGJ8=
		userid 1102381033197273*/
    }
};


$(document).ready(function(){
	"use strict";
	$("#confirmCancel").click(function(){$("#confirm").css("display","none");});
	$(".cancel, .OKButton, #imageClose").click(function(){hidePopup();});
	$("#alert .popupBody, #alertOK, #alertText").click(function(){hideAlert();});
	
	//Language BUTTONS
	$("#languageBtn").click(function(){
		//if (typeof(Storage) !== "undefined") {localStorage.setItem("ards-lang", selectedlang);}
	});
	$(".langmenuButton").click(function(){hidePopup(); showPopup("langmenu");});
	$("#langmenu .menuBodyItem").click(function(){changeLang($(this).prop("id").substr(5));});
	$("#gend_All").click(function(){changeGender("All");});
	$("#gend_Men").click(function(){$("#femaleCodeHolder").css("display", "none");  $("#maleCodeHolder").slideDown();});
	$("#gend_Wom").click(function(){$("#maleCodeHolder").css("display", "none"); $("#femaleCodeHolder").slideDown();});
	$("#language .langButton").click(function(){
		changeLang($(this).prop("id").substr(5)); 
		setTimeout(function() {audioOff(); showPage("gender");}, 500);
	 });
	$("#gen2_All").click(function(){changeGender("All");});
	$("#gen2_Men").click(function(){ $("#femaleCodeHolder2").css("display", "none"); $("#maleCodeHolder2").slideDown();});
	$("#maleCodeOK, #maleCodeOK2").click(function(){ authoriseGender("male");});
	$("#gen2_Wom").click(function(){ $("#maleCodeHolder2").css("display", "none"); $("#femaleCodeHolder2").slideDown();});
	$("#femaleCodeOK, #femaleCodeOK2").click(function(){ authoriseGender("female");});
	
	//MENU
	$(".menuButton, .menupage").click(function(){showPopup("menu");});
	$("#menuHeaderEditMoonLink").click(function(){showPage("editmoon");});
	$(".menuHeader").click(function(){hidePopup();});
	$("#disclaimerButton").click(function(){showPage("terms");});
	$(".privacy").click(function(){location.href="https://ards.com.au/resources/app-feedback/privacy-policy/";});
	$("#feedbackButton").click(function(){location.href="https://ards.com.au/resources/app-feedback/";});
	$("#aboutButton").click(function(){showPage("about");});
	
	
	
	//HEADER
	$(".headerPictureSearch").click(function(){showBody();});
	$(".headerListSearch").click(function(){showFull();});
	$(".headerCategorySearch").click(function(){showCategory();});
	
	//BODY MAP
	$(".backtomap").click(function(){
		var title=$("#bodyMapContent .headerBottomContainer h2").html();
		//console.log('title: '+title);
		if (currentpage==="bodyMapHead"){showPage("dashboard");}
		else if (title==="Ear" || title==="Brain" || title==="Mouth" || title==="Face" || title==="Neck"|| title==="Eye"|| title==="Nose"){showPage("bodyMapHead"); } 
		else{showPage("dashboard");}
	});
	//$("#switchMale").click(function(){switchBody("male");});
	//$("#switchFemale").click(function(){switchBody("female");});
	$(".entryBack").click(function(){showPage(referrer);});
	$('img[usemap]').rwdImageMaps();
	$('.areaM').on('click', function(){referrer='dashboard'; setHeadImage("male"); setBody($(this).prop('id').substr(7));});
	$('.areaF').on('click', function(){referrer='dashboard'; setHeadImage("female"); setBody($(this).prop('id').substr(7));});
	$('.area2').on('click', function(){referrer='bodyMapHead'; setBody($(this).prop('id').substr(7));});
	
	
	//search
	$("#headerSearchResult .searchresult").click(function(){
		setEntry("10");
		showPage('entry');
		hideSearch();
	});
	
	//Every time they hit enter it should hide the soft keyboard
	$('.searchInput').bind('keyup', function(e) {
		var code = e.keyCode || e.which; 
		if(code === 13) { $('.searchInput').blur(); }
		var val=$(this).val(); $('.searchInput').val(val);
		searchDictionary(val);
	});
	
	//BACK BUTTON ON ANDROID
	document.addEventListener("backbutton", onBackKeyDown, false);
	
	//AUDIO
	document.getElementById('audioPlayer').addEventListener("ended",function() {
       $(".audioIcon").attr("src","images/audio_on.png");
    });
	
	
	//catch missing audio files
	audioError=0;
	$("#audioPlayer").on("error", function () {
		var missingaudio=$("#audioPlayer").attr("src").substr(audiopath.length);
		//try looking for the file online
		if (audioError===0){
			var filename=audiopathServer+missingaudio;
			var audio = document.getElementById('audioPlayer');
			audio.setAttribute("src", filename);
			audioError++;
			audio.load();
		} else if (audioError===1){
			showAlert("<p>Sorry, but there's a problem playing the sound file. Let us know at ARDS so that we can improve the app. Tell us which entry you are playing and which type of phone you have (e.g. Android 8).</p> ");
			 //$("#audioPlayer").attr("src").substr(audiopathServer.length));
			$(".audioIcon").attr("src","images/audio_on.png");
			audioError=0;
		}
	});
	
	
	$(".audioButtonDiv").click(function(){
		//entryAudioDiv_Eng_liver_0
		//entryAudioIcon_Yol_liver_0
		toggleAudio(this.id);
	});
	
	
	
	$("input[type=text], input[type=email], input[type=password], textarea").click(function(){ $(this).focus();}); //this fixes text inputs sometimes not selecting on short tap
	
	
	
	getDictionary();
	getSpeakers();
});

//ANDROID listener when app moves to foreground - when picking contact
function onResume(resumeEvent) {
	"use strict";
    if(resumeEvent.pendingResult) {
        if(resumeEvent.pendingResult.pluginStatus === "OK") {
            var contact = navigator.contacts.create(resumeEvent.pendingResult.result);
            //console.log(JSON.stringify(contact));
        } else {
            //console.log("error getting contact "+resumeEvent.pendingResult.result);
        }
    }
}

window.addEventListener('load', function () {
		FastClick.attach(document.body);
	}, false);


$(document).click(function (e){
	"use strict";
	if(e.target.className!=="searchresult"){hideSearch();}
});


app.initialize();






