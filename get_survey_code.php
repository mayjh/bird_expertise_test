<?php
	//this script gets the survey code url from an ajax post 
	

	if(isset($_COOKIE['survey_code'])){
		echo $_COOKIE['survey_code'];
		//delete the cookie
		$date_of_expiry = time() - 60 ;
		setcookie( "survey_code", "", $date_of_expiry, "/" );
	}else{
		echo "null";
	}
	
	if(isset($_COOKIE['exp_id'])){
		//once the participant has finished, their 
		//cookie is deleted so that they can view the 
		//website as anyone else would
		$date_of_expiry = time() - 60 ;
		setcookie( "exp_id", "", $date_of_expiry, "/" );
	}
	

?>