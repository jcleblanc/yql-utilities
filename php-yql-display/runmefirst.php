<?php
/*************************************************************************************************************
* runmefirst.php
* YQL PHP OAuth Widget
*
* Created by Jonathan LeBlanc on 06/09/09.
* Copyright (c) 2009 Yahoo! Inc. All rights reserved.
* 
* The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
*************************************************************************************************************/

require_once('config.php');
require_once("php_sdk/Yahoo.inc");
require_once("CustomSessionStore.inc");
   
//initialize and store the user token store
$sessionStore = new CustomSessionStore();
$session = YahooSession::initSession(KEY, SECRET, APPID, TRUE, CALLBACK, $sessionStore);

//display token store event message
if ($session){
	echo "Widget tokens stored - you may now delete this file from your repository";
} else {
	echo "Failed to store widget access token - please contact the widget owner on twitter @jcleblanc";
}
?>
