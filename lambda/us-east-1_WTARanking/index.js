'use strict';

const Alexa = require('alexa-sdk');
const http = require('https');
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).
var alexaSDK;
var serviceError = 'Sorry, We are not able to get the current WTA Rankings';
var playerError = 'Sorry, We are not able to find the ranking for ';
var rankingError = 'Sorry, We are not able to find the player with ranking ';
var cardTitle = "WTA Rankings";
var goodByeMsg = 'Goodbye, Thank you for using the WTA Rankings skill';
var welcomeMsg = "Welcome to w. t. a. Rankings.\n";
var welcomeMsgCard = "Welcome to WTA Rankings.\n";
var helpMsg = "You can say any of the following.\n what is the current ranking of a particular player? For Example What is the current ranking of Serena Williams? \n" +
    "who is the current number one player? \n" +
    "who are the current top 10 players?";
var wtaRankingEndPoint = "https://s3.amazonaws.com/wta-singles-ranking/WTA_Singles_Ranking.json";
var defaultTop = 10;
var maxTop = 25;
var repromptMsg = "\n What else would you like to know?";
var tryAgainMsg = "Please try again.";
var noPlayerErrorMessage = "What player was that? " + tryAgainMsg;
var noRankingErrorMessage = "What ranking was that? " + tryAgainMsg;

//Helper Functions
function findPlayerRanking(arr, playerName) {
    console.log(playerName);
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].player.toUpperCase().indexOf(playerName.toUpperCase()) >= 0) {
            return arr[i];
        }
    }
    return null;
}

function findPlayerByRanking(arr, ranking) {
    console.log(ranking);
    if (ranking <= arr.length)
        return arr[ranking - 1];
    return null;
}
//End

function handlePlayerRankingRequest(playerName) {
    makeHttpRequest(wtaRankingEndPoint, function ResponseCallback(err, data) {
        var speechOutput = '';
        if (err) {
            alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);
        } else {
            var dataObj = JSON.parse(data);
            if (dataObj && dataObj.singlesRanking && dataObj.singlesRanking.length) {
                var playerRanking = findPlayerRanking(dataObj.singlesRanking, playerName);
                if (playerRanking != null) {
                    speechOutput = playerRanking.player + " is currently ranked world number " + playerRanking.ranking +
                        " with " + playerRanking.points + " points.";

                    //alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);
                    alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);

                }
                else {
                    //alexaSDK.emit(':tellWithCard', playerError + playerName, cardTitle, playerError + playerName, null);
                    var errorMessage = playerError + playerName + ". Please try some other player.";
                    alexaSDK.emit(':askWithCard', errorMessage, helpMsg, cardTitle, errorMessage, null);

                }
            }
            else {
                alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);

            }
        }

    });
}

function handlePlayerByRankingRequest(ranking) {
    makeHttpRequest(wtaRankingEndPoint, function ResponseCallback(err, data) {
        var speechOutput = '';
        if (err) {
            alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);
        } else {
            var dataObj = JSON.parse(data);
            if (dataObj && dataObj.singlesRanking && dataObj.singlesRanking.length) {
                var playerByRanking = findPlayerByRanking(dataObj.singlesRanking, ranking);
                if (playerByRanking != null) {
                    speechOutput = playerByRanking.player + " is currently ranked world number " + playerByRanking.ranking +
                        " with " + playerByRanking.points + " points.";
                    //alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);
                    alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);

                }
                else {
                    //alexaSDK.emit(':tellWithCard', rankingError + ranking, cardTitle, rankingError + ranking, null);
                    var errorMessage = rankingError + ranking + ". Please try some other player.";
                    alexaSDK.emit(':askWithCard', errorMessage, helpMsg, cardTitle, errorMessage, null);

                }
            }
            else {
                alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);

            }
        }

    });
}

function handleTopRankingRequest(top) {
    makeHttpRequest(wtaRankingEndPoint, function ResponseCallback(err, data) {
        var speechOutput = "WTA Rankings Top " + top + ".\n ";
        if (err) {
            alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);
        } else {
            var dataObj = JSON.parse(data);
            if (dataObj && dataObj.singlesRanking && dataObj.singlesRanking.length) {
                for (var i = 0; i < Math.min(dataObj.singlesRanking.length, top, maxTop); i++) {
                    speechOutput += "Number " + dataObj.singlesRanking[i].ranking + " " + dataObj.singlesRanking[i].player + " with " + dataObj.singlesRanking[i].points + " points.\n";
                }
                //alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);
                alexaSDK.emit(':tellWithCard', speechOutput, cardTitle, speechOutput, null);

            }
            else {
                alexaSDK.emit(':tellWithCard', serviceError, cardTitle, serviceError, null);

            }
        }

    });
}

function makeHttpRequest(endPoint, ResponseCallback) {
    http.get(endPoint, function (res) {
        var response = '';
        console.log('Status Code: ' + res.statusCode);
        if (res.statusCode != 200) {
            ResponseCallback(new Error(serviceError));
        }

        res.on('data', function (data) {
            response += data;

        });

        res.on('end', function () {
            ResponseCallback(null, response);
        });
    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        ResponseCallback(new Error(e.message));
    });
}

//Get the PlayerName from the intent
function getPlayerNameFromIntent(intent) {

    var playerSlot = intent.slots.PlayerName;

    if (!playerSlot || !playerSlot.value) {
        return null;
    } else {

        return playerSlot.value;
    }
}
//Get the top count from the intent
function getTopCountFromIntent(intent) {

    var topSlot = intent.slots.Top;

    if (!topSlot || !topSlot.value) {
        return defaultTop;
    } else {

        return topSlot.value;
    }
}

//Get the ranking from the intent
function getRankingFromIntent(intent) {

    var rankingSlot = intent.slots.Ranking;

    if (!rankingSlot || !rankingSlot.value) {
        return 0;
    } else {

        return rankingSlot.value;
    }
}

const handlers = {
    'LaunchRequest': function () {
        //welcomeMsg += helpMsg;
        this.emit(':askWithCard', welcomeMsg + helpMsg, helpMsg, cardTitle, welcomeMsgCard + helpMsg, null);
    },
    'PlayerRankingIntent': function () {
        alexaSDK = this;
        var playerName = getPlayerNameFromIntent(this.event.request.intent);
        if (playerName)
            handlePlayerRankingRequest(playerName);
        else
            this.emit(':ask', noPlayerErrorMessage, tryAgainMsg);
    },
    'PlayerByRankingIntent': function () {
        alexaSDK = this;
        var ranking = getRankingFromIntent(this.event.request.intent);
        if (ranking == 0)
            this.emit(':ask', noRankingErrorMessage, tryAgainMsg);
        else
            handlePlayerByRankingRequest(ranking);
    },
    'TopRankingIntent': function () {
        alexaSDK = this;
        var top = getTopCountFromIntent(this.event.request.intent);
        handleTopRankingRequest(parseInt(top));
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', helpMsg, helpMsg);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tellWithCard', goodByeMsg, cardTitle, goodByeMsg, null);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tellWithCard', goodByeMsg, cardTitle, goodByeMsg, null);
    },
    "Unhandled": function () {
        this.emit(':ask', helpMsg, helpMsg);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended");
    }
};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
