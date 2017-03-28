/// <reference path="psy.js" />

//helper functions 
function get_$_GET() {
    //Because AJAX fetches data via a separate HTTP request it won't include 
    //any information from the HTTP request that fetched the HTML document.
    //Thus $_GET will be empty in the PHP script. 
    //This gets the url parameters and sends them to the PHP script. 
    var parts = window.location.search.substr(1).split("&");
    var $_GET = {};
    for (var i = 0; i < parts.length; i++) {
        var temp = parts[i].split("=");
        $_GET[decodeURIComponent(temp[0])] = decodeURIComponent(temp[1]);
    }
    return ($_GET)
}

function read_text(file_name) {

    var result = "";
    $.ajax({
        url: 'read_text.php',
        type: 'POST',
        data: { file_name: file_name },
        dataType: 'text',
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;

}

function get_subj_num() {

    var result = "";
    $.ajax({
        type: 'POST',
        url: 'next_subj.php',
        dataType: 'text',
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
}

function grant_credit(completion_url) {

    //get the survey code stored in the session
    var survey_code = "";
    $.ajax({
        type: 'POST',
        url: 'get_survey_code.php',
        dataType: 'text',
        async: false,
        success: function (data) {
            survey_code = data;
        }
    });
    
    //redirect the user with the completion url
    if (survey_code != "null") {
        //if they have a survey code then redirect them
        var completion_url = completion_url.split("&survey_code=XXXX");
        window.location = completion_url[0] + "&survey_code=" + survey_code;
        window.opener.location.reload();
    } else {
        //otherwise close the window
        window.opener.location.reload();
        window.close();
    }

}

$(document).ready(on_doc_load());

function on_doc_load() {


    //prevent user from hitting the backspace key
    //and exiting the program
    $(document).on("keydown", function (e) {
        if ((e.which === 8 || e.keyCode == 8) && !$(e.target).is("input, textarea")) {
            e.preventDefault();
        }
    });

    //get the subject number
    //var subj_num = get_subj_num();
    var subj_num=undefined;
    
    //read in the bird image list
    var bird_list_file_name = 'Lists/birdlist.txt';
    var bird_list = read_text(bird_list_file_name);

    //read in the word list
    var word_list_file_name = 'Lists/wordlist.txt';
    var word_list = read_text(word_list_file_name);
    
    //read in answer and level list
    var level_list = read_text('Lists/levellist.txt');
    var answer_list = read_text('Lists/answer.txt');
    
    //convert the character string to a 
    //character array
    bird_list = bird_list.split('\n');
    word_list = word_list.split('\n');
    level_list = level_list.split('\n');
    answer_list = answer_list.split('\n');
    
    var instructions = new Message();
    instructions.text = "\n\n\nThe following is a test of your bird knowledge. " 
    + "In this test, you will identify many different bird species. An image of a bird will be presented along "
    + "with 4 species names. Your task is to choose the correct species name for the bird presented in the image. "
    + "The choice options are labeled 1, 2, 3, and 4. You will make your responses by pressing the corresponding key "
    + "on the keyboard.\n\nAt the end of the test, you will be provided a bird expertise score. The task is "
    + "difficult and we expect that even the best bird experts will not get all the multiple choice questions correct."
    + "\n\nThe entire test lasts approximately 10 minutes. Click below to begin.";
    instructions.header = 'Welcome!';
    instructions.button = true;
    instructions.css_id.message_container = 'instruction_container';
    instructions.css_id.message_header = 'instruction_header';

    var ready_message = new Message();
    ready_message.text = "\n \n \n Please note that this is a speeded bird knowledge test. "
			    + "The picture will stay on the screen for only 5 seconds. Try to respond within 5 seconds, " 
			    + "and always make a response even if you have to guess. "
			    + "\n\n Please don't refer to any books or Internet for help during the test. "
			    + "\n\n\n When you are ready, click on the button below to start.";
    ready_message.header = "ready?";
    ready_message.button = true;
    ready_message.button_text = "proceed";     
    ready_message.css_id.message_container = 'instruction_container';
    ready_message.css_id.message_header = 'instruction_header';
    
    var message_end = new Message();
    message_end.css_id.message_header = 'instruction_header';
    message_end.css_id.message_container = 'instruction_container';
    message_end.text = "You Have Finished The Experiment! This test was designed to quantify bird identification skill and provide a measure of bird expertise. Thank You For Your Participation!"
        + "\n\n\nStudents: You will now be redirected to SONA to receive credit.";
    message_end.button = true;
    message_end.header = "Test finished!";
    message_end.button_text = "close";
    
    var img1 = new Img();
    img1.time = 5000;
    img1.list = bird_list.slice(0,5);
    img1.height = 450;
    img1.width = 450;
    img1.allowed_responses = ['1', '2', '3', '4']; //49,50,51,52
    img1.preload();
    img1.text = word_list.slice(0,5);
    
    var isi = new Blank_Screen();
    isi.time = 1000;
    
    var block1 = new Block();
    block1.structure = [isi, img1];
    block1.list_length = img1.list.length;
    
    //make an upload object
    var upload = new Uploader();
    //$_GET = get_$_GET();//get subject parameters
    //upload.data.partial = 'false';
    //upload.data.exppart_id = $_GET['exppart_id'];
    //upload.data.partsession_id = $_GET['partsession_id'];
    Data_Handler.data.properties.birdlist = bird_list;
    Data_Handler.data.properties.wordlist = word_list;
    //upload.data.cur_sess = $_GET['cur_sess'];
    upload.data.filelocation = 'Results/';
    upload.data.exp_name = 'VBET2014';
    upload.script = 'save_results_local.php';
    

    var exp = new Experiment();
    exp.structure = [instructions,ready_message, block1, upload];
    exp.run().then(
    	function () {
    	var test_result = new Message();
	    test_result.css_id.message_header = 'instruction_header';
	    test_result.css_id.message_container = 'instruction_container';
	    test_result.button = true;
	    test_result.button_text = "Continue";
	    test_result.header = "Bird Expertise Test Result";
	    acc = [0,0,0,0];
	    nperlev = [0,0,0,0];
	    
	    	for (var i = 0; i < Data_Handler.data.response.length; i++) {
	    	var key = Number(answer_list[i]);
	        var itemacc = Number(Number(Data_Handler.data.response[0])==key);
	    
		    switch (level_list[i]) {
		    case "Practice":
		        acc[0] = acc[0]+itemacc;
		        nperlev[0] = nperlev[0]+1;
		        break;
		    case "Novice":
		        acc[0] = acc[0]+itemacc;
		        nperlev[0] = nperlev[0]+1;
		        break;
	        case "Beginner":
		        acc[1] = acc[1]+itemacc;
		        nperlev[1] = nperlev[1]+1;
	        	break;
		    case "Intermediate":
		        acc[1] = acc[1]+itemacc;
		        nperlev[1] = nperlev[1]+1;
		        break;
		    case "Advanced":
		        acc[2] = acc[2]+itemacc;
		        nperlev[2] = nperlev[2]+1;
		        break;
		    case "Expert":
		        acc[2] = acc[2]+itemacc;
		        nperlev[2] = nperlev[2]+1;
		        break;
		    }
		}
		acc[3]=acc[0]+acc[1]+acc[2]; //total correct count
		nperlev[3]=nperlev[0]+nperlev[1]+nperlev[2]; //total trial number
		test_result.text = "Test items of various difficulties were mixed together to create " +
					"the test you just completed.  Trial selection was done such that, in general, " +
					"items increased in difficulty as you proceeded though the test.  " +
					"Below are your results broken down by the difficulty of the test item.  " +
					" \n" +
					"\nBeginner:       " + acc[0].toString() + ' correct out of ' + nperlev[0].toString() +
					" (" + (100*acc[0]/nperlev[0]).toFixed(1).toString() + '%)' + 
					"\nIntermediate:  " + acc[1].toString() + ' correct out of ' + nperlev[1].toString() +
					" (" + (100*acc[1]/nperlev[1]).toFixed(1).toString() + '%)' + 
					"\nAdvanced:      " + acc[2].toString() + ' correct out of ' + nperlev[2].toString() + 
					" (" + (100*acc[2]/nperlev[2]).toFixed(1).toString() + '%)' + 
				  	"\n\nOverall:         " + acc[3].toString() + ' correct out of ' + nperlev[3].toString() +
					" (" + (100*acc[3]/nperlev[3]).toFixed(1).toString() + '%)' ;
					
		var feedback =new Experiment();
	    feedback.structure = [test_result, message_end];
	    feedback.run().then(
	    	function () {
        	grant_credit("https://vanderbilt.sona-systems.com/webstudy_credit.aspx?experiment_id=1976&credit_token=134bb52348ca4aca9b04a54c85eb928d&survey_code=XXXX")
        });
    });
    


}