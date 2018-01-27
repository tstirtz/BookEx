/// <reference types="aws-sdk" />
const tasteDiveUrl = "https://tastedive.com/api/similar?callback=?";
const googleBooksUrl = "https://www.googleapis.com/books/v1/volumes";
const amazonProductAddUrl ="https://webservices.amazon.com/onca/xml";




let i = 0;
let text = "Let's find your next book!";
let speed = 75;


function headerTypeWriter(){

  if(i < text.length){
    document.getElementById("header").innerHTML += text.charAt(i);
    i++;
    setTimeout(headerTypeWriter, speed);
  }
}


function handleSearchButton(){

  console.log("start of handleSearchButton working");

  $(".js-search-button").on("click", function(){
    //event.stopPropagation();
    handleNewSearch();
    let searchInputValue= $(this).prev().val();

    console.log(searchInputValue);


    requestFromTasteKid(searchInputValue, function(json){
      console.log(json);

      if(searchInputValue.length === 0){
        $(".js-main").append(`<p>Sorry, please enter a book to be searched.</p>`);
      }else {

        console.log(json.Similar.Results);

        handleSuggestionClick(json);

        const resultItems = json.Similar.Results.map(function(result, index){

          const bookSuggestionName = result.Name;
          const bookSynopsis = result.wTeaser;
          const removeComma = bookSuggestionName.replace(/\'/, '');
          const encBookName = encodeURIComponent(removeComma);
          console.log(index);

          requestFromGoogleBooks(bookSuggestionName, function(resultObj){
            console.log("start of requestFromGoogleBooks working");
            console.log(resultObj);
            console.log("end of requestFromGoogleBooks working");




            $(".js-book-suggestions").append(
              `<a href="#" class="${index}" id= "${encBookName}"><p>${bookSuggestionName}</p></a>
               <a href="#" class="${index}" id= "${encBookName}"><img src="${resultObj['items'][0]['volumeInfo']['imageLinks']['smallThumbnail']}"></a>
              `);

            });

        });
      }
    });
    clearSearchInput();
  });
  console.log("end of handleSearchButton working");
}





function renderBookSuggestions(){
  //append results to html
}

function handleNewSearch(){
  $(".js-book-suggestions").empty();
  $(".js-sale-info").empty();
}

function clearSearchInput(){
  $(".js-book-search-input").val('');
}




function handleSuggestionClick(tasteDiveObj){
  //book suggestion or title link is clicked
  $(".js-book-suggestions").on('click', "a", function(){
      console.log("start of handleSuggestionClick working");
      // event.stopPropagation();

    handleNewSearch();

    let clickedBook = parseInt($(this).attr("class")); //changes class attribute type to number to be used as an index
    console.log(tasteDiveObj);

    let clickedEncodedTitle = $(this).attr("id");//get ID value, which is the encoded title, of the clicked links to be passed
    console.log(clickedEncodedTitle);

    requestFromAmazonProdAdd(clickedEncodedTitle);

    let synopsis = tasteDiveObj["Similar"]["Results"][clickedBook]["wTeaser"];

    $(".js-book-suggestions").append("<p>" + synopsis + "</p>");

    console.log("end of handleSuggestionClick working");
  });
}





function getPricesOfClickedBook(amazonData){
    console.log("start of getPricesOfClickedBook working");

    //Check if browser is Chrome
    if(navigator.userAgent.indexOf("Chrome") > -1){
      let allOffersUrlChrome = amazonData.getElementsByTagName("ItemLinks")[0].childNodes[6].childNodes[1].childNodes[0].nodeValue;
        console.log(allOffersUrlChrome);

      requestToAmazonForUsedPrices(allOffersUrlChrome);
    }//Check if browser is Firefox
    else if (navigator.userAgent.indexOf("Firefox") > -1){
      let allOffersUrlFirefox = amazonData.activeElement['childNodes'][1]['childNodes'][4]['childNodes'][2]['childNodes'][6]['childNodes'][1]['innerHTML'];
      console.log(allOffersUrlFirefox);

      requestToAmazonForUsedPrices(allOffersUrlFirefox);
    }
    console.log("end of getPricesOfClickedBook working");
}






function requestToAmazonForUsedPrices(pricesUrl){
  //when book suggestion is clicked make call to amazon offer listing url api
  console.log("start of requestToAmazonForUsedPrices working");


  $.ajax({
    url: pricesUrl,
    type: 'POST',
    contentType: "text/plain; charset=utf-8",
    dataType: 'text',
    //data: data,
    processData: false,
    success: function(data){

      parser= new DOMParser();
      htmlDoc = parser.parseFromString(data, 'text/html')
      console.log(htmlDoc);

      $(".js-sale-info").empty();


      //retrieve price of used books
      let priceInfo= htmlDoc.getElementsByClassName("olpOfferPrice");
      $.each(priceInfo, function(index, value){
        console.log(priceInfo[index]['innerHTML']);
        let bookPrices = priceInfo[index]['innerHTML'];
        $(".js-sale-info").append(
          `<div class= "${index}">
            <span>${bookPrices}</span>
          </div>`
        );
      });

      //retrieve shipping cost info
      let shippingData= htmlDoc.getElementsByClassName("olpShippingInfo");
      $.each(shippingData, function(index){
        let shippingCost = shippingData[index]['firstChild']['nextElementSibling']['children'][0]['innerText'];
        console.log(shippingCost);
        $(`.${index}`).append(`<span>Shipping: ${shippingCost}</span>`);
      });

      //retrieve shipping dates
      let shippingDates= htmlDoc.getElementsByClassName("olpAvailabilityExpander");
      $.each(shippingDates, function(index){
        let estimatedShipping = shippingDates[index]['children'][0]['childNodes'][2]['data'];
        console.log(estimatedShipping);

        $(`.${index}`).append(`<span> Estimated Shipping Date ${estimatedShipping}</span>`);
      });

      //get the offer ID's for the used book offers
      let offerIds = htmlDoc.getElementsByName("offeringID.1");
      $.each(offerIds, function(index, value){

        console.log(offerIds[index]['value']);
        let offerIdValue = offerIds[index]['value'];


        $(`.${index}`).append(`<a href = "#" type="button" class= "js-purchase-book-${index}" id="${offerIdValue}" >Buy</button></a>`);

        handleBuyButton(index);
      });

    },
    error: function(){
      console.log("cannot get data");
    }
  });
  console.log("end of requestToAmazonForUsedPrices working");
}




function handleBuyButton(index){
  //send request to amazon with offer listing ID on down click
  //on up click take user to Purchase URL
  $('.js-sale-info').on('mousedown', `.js-purchase-book-${index}`, function(){
    // event.stopPropagation();
    let offerId = $(this).attr("id");
    console.log(offerId);
      cartCreateAWSRequest(offerId, index);
  });
}

function logJsonResults(json){
  console.log(json);
}

//left off here: testing to see if logJsonResults will work as a jsonpCallback



function requestFromTasteKid(searchVal, callback){
//Next Step: set an environment variable for api keys

  $.ajax({
    url: tasteDiveUrl,
    dataType: "jsonp",
    error: function(){
      console.log(`request failed`);
      $(".js-main").append("Sorry, your search failed. Please try again.");},
    success: callback,
    data:{
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k: keys.tasteDive,
    verbose: 1,
    crossDomain: true,
    limit: 10,
    format:"json"}

  });

}





function requestFromGoogleBooks(searchVal, callback){
  //make call to Google Books api to get book cover images
  console.log(searchVal);
  const requestSetting={
    q: `${searchVal}`,
    intitle: `${searchVal}`,
    key: keys.googleBooks,
    //orderBy: "relevance",
    maxResults: 1
  };

  $.getJSON(googleBooksUrl, requestSetting, callback);

}





function requestFromAmazonProdAdd(suggestionTitle){

  let dt = new Date();
  let dateISO = (dt.toISOString());
  let dateMinusMilliSec = dateISO.replace(/\.[0-9]{3}/, '');
  let encodedUtcDate = encodeURIComponent(dateMinusMilliSec);


  let awsUrlForSignature=
`GET
webservices.amazon.com
/onca/xml
AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Condition=Used&Keywords=${suggestionTitle}&Operation=ItemSearch&ResponseGroup=ItemAttributes%2COffers%2COfferSummary&SearchIndex=Books&Service=AWSECommerceService&Sort=relevancerank&Timestamp=${encodedUtcDate}&Title=${suggestionTitle}`;


  var signature1 = CryptoJS.HmacSHA256(awsUrlForSignature, keys.secretKey);

  let sigBase64 = signature1.toString(CryptoJS.enc.Base64);
  let encodedSig = encodeURIComponent(sigBase64);


    let awsUrl = `http://webservices.amazon.com/onca/xml?AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Condition=Used&Keywords=${suggestionTitle}&Operation=ItemSearch&ResponseGroup=ItemAttributes%2COffers%2COfferSummary&SearchIndex=Books&Service=AWSECommerceService&Sort=relevancerank&Timestamp=${encodedUtcDate}&Title=${suggestionTitle}&Signature=${encodedSig}`;



  $.ajax({
    url: awsUrl,
    dataType: "xml",

    success: function(requestObj){
      console.log("start of requestFromAmazonProdAdd working");
      console.log(requestObj);
      getPricesOfClickedBook(requestObj);
      console.log("end of requestFromAmazonProdAdd working");
    }
  });

}



function cartCreateAWSRequest(offerListingId, index){

  let dt = new Date();
  let dateISO = (dt.toISOString());
  let dateMinusMilliSec = dateISO.replace(/\.[0-9]{3}/, '.000');
  let encodedUtcDate = encodeURIComponent(dateMinusMilliSec);


  let awsCartCreateUrlForSignature=
`GET
webservices.amazon.com
/onca/xml
AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Item.1.OfferListingId=${offerListingId}&Item.1.Quantity=1&Operation=CartCreate&Service=AWSECommerceService&Timestamp=${encodedUtcDate}`;


  var signature1 = CryptoJS.HmacSHA256(awsCartCreateUrlForSignature, keys.secretKey);

  let sigBase64 = signature1.toString(CryptoJS.enc.Base64);
  let encodedSig = encodeURIComponent(sigBase64);


    let awsCartCreateUrl = `http://webservices.amazon.com/onca/xml?AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Item.1.OfferListingId=${offerListingId}&Item.1.Quantity=1&Operation=CartCreate&Service=AWSECommerceService&Timestamp=${encodedUtcDate}&Signature=${encodedSig}`;



  $.ajax({
    url: awsCartCreateUrl,
    dataType: "xml",
    success: function(requestData){
          console.log(requestData);

          let amazonPurchaseURL = requestData.getElementsByTagName("PurchaseURL")[0]['textContent'];

          console.log(amazonPurchaseURL);

          $(`.js-purchase-book-${index}`).attr("href", `${amazonPurchaseURL}`);

          window.location.href = amazonPurchaseURL;
    }
  });

}


function docReadyFunctions(){
  handleSearchButton();
  headerTypeWriter();
}




$(docReadyFunctions);
