/*************************************************************************************************************
* yql_php_widget.js
* YQL PHP OAuth Widget
*
* Created by Jonathan LeBlanc on 06/09/09.
* Copyright (c) 2009 Yahoo! Inc. All rights reserved.
* 
* The copyrights embodied in the content of this file are licensed under the BSD (revised) open source license.
*************************************************************************************************************/

//YUI includes for connection manager and json utilities
if (! window.YAHOO){
	document.write('<script type="text/javascript" src="http://yui.yahooapis.com/combo?2.7.0/build/yahoo/yahoo-min.js&2.7.0/build/event/event-min.js&2.7.0/build/connection/connection-min.js"></script>' +
	               '<script src="http://yui.yahooapis.com/2.7.0/build/json/json-min.js"></script>');
}
   
yqlWidget = function() {
	//property instantiation
	var yqlPublicQueryURL = "http://query.yahooapis.com/v1/yql?";
	var widgetStack = [];
	var currString, resultFormat, queryInsert, setupConfig = [];
	var regex = /\{([\w\-\.\[\]]+)\}/gi;	//regex to search for content within curly brackets
	
	/************************************************************
	* Method: YUI POST Status Handlers 
	* Description: YUI POST status functions
	************************************************************/
	var onYQLReqFailure = function(o){ if (setupConfig['debug'] && window.console){ console.log('GET request failed'); }}
    
	/************************************************************
	* Method: Get YQL Data
	* Description: Use the query provided to make a request to 
	*              YQL endpoint to capture data
	************************************************************/
    var getYQLData = function(query){
		//prepare the URL & post data for the Yahoo! connection manager POST:
        var sURL = "private_data_fetch.php";
		var postData = "q=" + query;
		
		//define connection manager event callbacks
		var callback = {
		  success:parseYQLResults,
		  failure:onYQLReqFailure
		};
		
		//make POST request to YQL with provided query
        var transactionObj = YAHOO.util.Connect.asyncRequest('POST', sURL, callback, postData);
		
		return transactionObj;
    }
	
	/************************************************************
	* Method: Parse YQL Results
	* Description: Using the result set, parse the YQL results
	*			   into display mode
	************************************************************/
	var parseYQLResults = function(response){
		if (response.responseText){
			var jsonResponse = YAHOO.lang.JSON.parse(response.responseText);
			results = jsonResponse['results'].query.results
			
			//get first JSON node - use loop due to first node being an unknown object
			var firstChild;
			for (var child in results){
				if (results.hasOwnProperty(child)){
					firstChild = results[child];
					break;
				}
			}
			
			//capture badge and display if a badge display is requested
			var badge = jsonResponse['badge'].query.results.profile;
			var html = "";
			if (setupConfig['badge'] && badge){
				html += "<div id='badgeContainer'><a href='"+badge.profileUrl+"' target='_blank'><img src='"+badge.image.imageUrl+"' width='48' height='48' /></a>"
  				      + "<a href='"+badge.profileUrl+"' target='_blank'>" + badge.nickname + "</a> (" + badge.location + ")<br />"
					  + "<span>"+badge.status.message+"</span></div><div style='clear:both;height:1px;'></div>";
			}
			
			//loop through all YQL return elements and replace user defined results within {} using regex
			if (firstChild.length !== undefined){
				//multiple results - array
				var displayNum = (setupConfig['num_results']) ? setupConfig['num_results'] : firstChild.length;
				for(var i = 0; i < displayNum; i++){
					html += parseConfig(firstChild[i]);
				}
			} else {
				//single result - object
				html += parseConfig(firstChild);
			}
			
			//dump result HTML into user defined insert container
			document.getElementById(queryInsert).innerHTML = html;
			
			//attempt to load next widget off of the stack
			yqlWidget.render();
		}
	}
	
	/************************************************************
	* Method: Parse Config
	* Description: Loop through configuration array for provided
	*              data set node
	************************************************************/
	var parseConfig = function(node){
		currString = node;
		
		//replace YQL result placeholders with return content
		if (resultFormat){ currString = resultFormat.replace(regex, function(matchedSubstring, index, originalString){
			var data = eval("currString." + index);
			if (data == ""){ return ""; }
			
			//convert timestamps to UTC strings
			if(data.match(/^[0-9]{1,}$/)){ 
				var currentTime = new Date()
				currentTime.setTime(data * 1000);
				return (currentTime.toUTCString());
			}
			
			return data;
		});}
		
		return currString;
	}

	/************************************************************
	* Method: Public Function Return
	* Functions: init - starts yql parsing functions
	*			 getYQLDataCallback - yql run callback
	************************************************************/
    return {
		//push widget on the load stack
		push: function(query, config, format, insertEl){
			//validate widget variables
			if (query == null || format == null || insertEl == null){
				if (setupConfig['debug'] && window.console){ console.log('Missing query, return format or insert element'); }
				return null;
			}
			
			//push widget load on the stack
			widgetStack.push(function(){ yqlWidget.init(query, config, format, insertEl); });
		},
		
		//pop widget off the load stack and execute
		render: function(){ if (widgetStack.length > 0){ widgetStack.pop()(); } },
	
		//widget initialization
        init: function(query, config, format, insertEl){ 
			resultFormat = format; queryInsert = insertEl;
			if (config){ setupConfig = config; }
			return getYQLData(query);
		}, 
		
		//yql data caption success callback
		getYQLDataCallback: function(o){
			if (! o.query){
				if (setupConfig['debug'] && window.console){ console.log('YQL query returned no results'); }
				return null;
			}
			parseYQLResults(o.query.results);
		}
	}
}();
