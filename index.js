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

  $(".js-search-button").on("click", function(event){
    event.preventDefault();
    console.log("click function working");

    handleNewSearch();
    let searchInputValue= $(this).prev().val();

    console.log(searchInputValue);



    requestFromTasteKid(searchInputValue, function(json){
      console.log(json);

      if(json.Similar.Results.length === 0){
        $(".start-page-container").append(`<p class= "error-message">Sorry, we could't find anything related to "${searchInputValue}". Check spelling or try another book.</p>`);
      }else {
        $('.js-main').prop('hidden', false);
        $(".js-suggestions-header").prepend(`<h2>Books related to "${searchInputValue}"</h2>`);
        console.log(json.Similar.Results);

        handleSuggestionClick(json);

        const resultItems = json.Similar.Results.map(function(result, index){

          const bookSuggestionName = result.Name;
          const bookSynopsis = result.wTeaser; //wTeaser is the book synopsis
          const removeComma = bookSuggestionName.replace(/\'/, '');
          const encBookName = encodeURIComponent(removeComma);
          console.log(index);

          console.log(encBookName);

          requestFromGoogleBooks(bookSuggestionName, function(resultObj){

            console.log(resultObj);

            $(".js-book-suggestions").append(
              `<div class="result-item">
                <p>${bookSuggestionName}</p>
                 <a class="${index} book-cover-link" id= "${encBookName}"><img src="${resultObj['items'][0]['volumeInfo']['imageLinks']['smallThumbnail']}" class = "cover-image" alt= "Image of the book cover of ${bookSuggestionName}"></a>
               </div>
              `);

            });

        });
      }
    });
    clearSearchInput();
  });
  $(".js-search-button").on("keypress", function(keypressed){
    //if enter key is pressed call the search button click function
    if(keypressed === 13){

      $(".js-search-button").on();
    }
  });
}




function scrollPage(){
    console.log("scroll page called");

    setTimeout(function(){
        //calculate height of start page
        let scrollPosition = $('.start-page').height();
        //scroll to position equal to height of starting page
        window.scroll({
            top: scrollPosition,
            left: 0,
            behavior: "smooth"
    })}, 2500);
}




function handleNewSearch(){
  $(".js-suggestions-header").empty();
  $(".js-book-suggestions").empty();
  $(".js-price-container").empty();
  $(".error-message").remove();
}




function clearSearchInput(){
  $(".js-book-search-input").val('');
}




function handleSuggestionClick(tasteDiveObj){
  //book suggestion or title link is clicked
  $(".js-book-suggestions").on('click', "a", function(){

    handleNewSearch();

    let clickedBook = parseInt($(this).attr("class")); //changes class attribute type to number to be used as an index
    console.log(tasteDiveObj);

    let clickedEncodedTitle = $(this).attr("id");//get ID value, which is the encoded title, of the clicked links to be passed

    requestFromAmazonProdAdd(clickedEncodedTitle);

    let synopsis = tasteDiveObj["Similar"]["Results"][clickedBook]["wTeaser"];
    let title = tasteDiveObj["Similar"]["Results"][clickedBook]["Name"];

    $(".js-book-suggestions").append(
      `<h2>${title}</h2>
      <p class= "synopsis">${synopsis}</p>`);
    scrollPage();//Need to adjust scroll position
  });
}




function getPricesOfClickedBook(amazonData){

    //Check if browser is Chrome
    if(navigator.userAgent.indexOf("Chrome") > -1  || navigator.userAgent.indexOf("Safari") > -1){
      let allOffersUrlChrome = amazonData.getElementsByTagName("ItemLinks")[0].childNodes[6].childNodes[1].childNodes[0].nodeValue;


      requestToAmazonForUsedPrices(allOffersUrlChrome);
    }//Check if browser is Firefox
    else if (navigator.userAgent.indexOf("Firefox") > -1){
      let allOffersUrlFirefox = amazonData.activeElement['childNodes'][1]['childNodes'][4]['childNodes'][2]['childNodes'][6]['childNodes'][1]['innerHTML'];

      requestToAmazonForUsedPrices(allOffersUrlFirefox);
    }
}




function requestToAmazonForUsedPrices(pricesUrl){
  //when book suggestion is clicked make call to amazon offer listing url api

  $.ajax({
    url: "https://rift-lycra.glitch.me/postmedata",
    type: 'GET',
    data: {url: pricesUrl},
    success: function(data){
      //parse data to html
      parser= new DOMParser();
      htmlDoc = parser.parseFromString(data, 'text/html')

      $(".js-sale-info").prop('hidden', false);
      $(".js-price-container").empty();
      $(".js-price-container").prepend(
        `<header role= "navigation" class= "prices-header">
            <h3>Used Book Prices</h3>
         </header>`);

      //retrieve price of used books
      let priceInfo= htmlDoc.getElementsByClassName("olpOfferPrice");
      $.each(priceInfo, function(index, value){

        let bookPrices = priceInfo[index]['innerHTML'];
        $(".js-price-container").append(
          `<div class= "${index} individual-price-info">
            <span class= "col-2">${bookPrices}</span>
          </div>`
        );
      });

      //retrieve shipping cost info
      let shippingData= htmlDoc.getElementsByClassName("olpShippingInfo");
      $.each(shippingData, function(index){
        let shippingCost = shippingData[index]['firstChild']['nextElementSibling']['children'][0]['innerText'];

        $(`.${index}`).append(`<div class= "col-2"><strong>Shipping:</strong><br>${shippingCost}</div>`);
      });

      //retrieve shipping dates
      let shippingDates= htmlDoc.getElementsByClassName("olpAvailabilityExpander");


      $.each(shippingDates, function(index){
        let estimatedShipping = shippingDates[index]['children'][0]['childNodes'][2]['data'];


        $(`.${index}`).append(`<div class= " shipping-date col-2"><strong>Shipping Date:</strong><br>${estimatedShipping}</div>`);
      });

      //retrieve seller name
      let getSellerInfo = htmlDoc.getElementsByClassName("olpSellerColumn");

      $.each(getSellerInfo, function(index){


          if(getSellerInfo[index]['childNodes'][1]['childNodes'][1]['childNodes']['length'] === 0){

            let sellerName = "No Seller Name";

            $(`.${index}`).append(`<div class= "seller-name col-2"><strong>Seller:</strong><br>${sellerName}</div>`);

          }else {
            let sellerName = getSellerInfo[index]['childNodes'][1]['childNodes'][1]['childNodes'][1]['childNodes'][0]['nodeValue'];

            $(`.${index}`).append(`<div class= "seller-name col-2"><strong>Seller:</strong><br>${sellerName}</div>`);
          }


          if(getSellerInfo[index]['childNodes'].length < 4){

            let sellerRating = "No Seller Rating";

            $(`.${index}`).append(`<div><strong>Seller Rating:</strong><br> ${sellerRating}</div>`);
          }else{
            let sellerRating = getSellerInfo[index]['childNodes'][3]['childNodes'][3]['childNodes'][0]['innerText'];

            $(`.${index}`).append(`<div><strong>Seller Rating:</strong><br> ${sellerRating}</div>`);
          }


      });

      //get the offer ID's for the used book offers
      let offerIds = htmlDoc.getElementsByName("offeringID.1");
      $.each(offerIds, function(index, value){

        let offerIdValue = offerIds[index]['value'];

        $(`.${index}`).append(`<div class="purchase-button col-2"><a type="button" class= "js-purchase-book-${index}" id="${offerIdValue}">Buy <span class= "visibility">From Amazon</span></button></a></div>`);

        handleBuyButton(index);
      });

    },
    error: function(){
      console.log("cannot get data");
    }
  });
}




function handleBuyButton(index){
  //send request to amazon with offer listing ID on down click
  //on up click take user to Purchase URL
  $('.js-sale-info').on('click', `.js-purchase-book-${index}`, function(){
    let offerId = $(this).attr("id");
        $(".load-indicator").prop('hidden', false);
      cartCreateAWSRequest(offerId, index);
  });
}




function requestFromTasteKid(searchVal, callback){


  $.ajax({
    url: tasteDiveUrl,
    dataType: "jsonp",
    error: function(){
      console.log(`request failed`);
      $(".js-main").append("Sorry, your search failed. Please try again.");},
    success: callback,
    error: function(jqXHRObject, typeOfError){
      console.log("Taste Dive error message: " + typeOfError)
      $(".start-page-container").append(`<div class= "error-message">Sorry there was an error from server, please try again.</div>`);
    },
    complete: scrollPage(),
    data:{
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k: keys.tasteDive,
    verbose: 1,
    crossDomain: true,
    format: "json"
  }

  });

}




function requestFromGoogleBooks(searchVal, callback){
  //make call to Google Books api to get book cover images
  const requestSetting={
    q: `${searchVal}`,
    intitle: `${searchVal}`,
    key: keys.googleBooks,
    maxResults: 1
  };

  $.getJSON(googleBooksUrl, requestSetting, callback).fail(function(){
      $(".error-message").empty();
      $(".start-page-container").append(`<div class= "error-message">Sorry there was an error, please try again later.</div>`);
  });

}





function requestFromAmazonProdAdd(suggestionTitle){
  //variable to encode the URL into the correct format to pass through CrptoJS encoding script
  let dt = new Date();
  let dateISO = (dt.toISOString());
  let dateMinusMilliSec = dateISO.replace(/\.[0-9]{3}/, '');
  let encodedUtcDate = encodeURIComponent(dateMinusMilliSec);


  let awsUrlForSignature=
`GET
webservices.amazon.com
/onca/xml
AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Condition=Used&Keywords=${suggestionTitle}&Operation=ItemSearch&ResponseGroup=ItemAttributes%2COffers%2COfferSummary&SearchIndex=Books&Service=AWSECommerceService&Sort=relevancerank&Timestamp=${encodedUtcDate}&Title=${suggestionTitle}`;//Do not tab this string template over!

  //encodes url to create a signature that is added on the end of the URL for request to AWS
  var signature1 = CryptoJS.HmacSHA256(awsUrlForSignature, keys.secretKey);

  let sigBase64 = signature1.toString(CryptoJS.enc.Base64);
  let encodedSig = encodeURIComponent(sigBase64);


    let awsUrl = `https://webservices.amazon.com/onca/xml?AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Condition=Used&Keywords=${suggestionTitle}&Operation=ItemSearch&ResponseGroup=ItemAttributes%2COffers%2COfferSummary&SearchIndex=Books&Service=AWSECommerceService&Sort=relevancerank&Timestamp=${encodedUtcDate}&Title=${suggestionTitle}&Signature=${encodedSig}`;



  $.ajax({
    url: "https://rift-lycra.glitch.me/givemedata",
    dataType: "xml",
    data: { url: awsUrl },
    headers:{
       'Access-Control-Allow-Origin': '*'
    },
    success: function(requestObj){
      getPricesOfClickedBook(requestObj);
    }
  });

}



function cartCreateAWSRequest(offerListingId, index){
  //request to AWS to create a cart after buy button is clicked
  let dt = new Date();
  let dateISO = (dt.toISOString());
  let dateMinusMilliSec = dateISO.replace(/\.[0-9]{3}/, '.000');
  let encodedUtcDate = encodeURIComponent(dateMinusMilliSec);


  let awsCartCreateUrlForSignature=
`GET
webservices.amazon.com
/onca/xml
AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Item.1.OfferListingId=${offerListingId}&Item.1.Quantity=1&Operation=CartCreate&Service=AWSECommerceService&Timestamp=${encodedUtcDate}`; //Do not tab this string template over!


  var signature1 = CryptoJS.HmacSHA256(awsCartCreateUrlForSignature, keys.secretKey);

  let sigBase64 = signature1.toString(CryptoJS.enc.Base64);
  let encodedSig = encodeURIComponent(sigBase64);


    let awsCartCreateUrl = `https://webservices.amazon.com/onca/xml?AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Item.1.OfferListingId=${offerListingId}&Item.1.Quantity=1&Operation=CartCreate&Service=AWSECommerceService&Timestamp=${encodedUtcDate}&Signature=${encodedSig}`;



  $.ajax({
    url: "https://rift-lycra.glitch.me/givemedata",
    dataType: "xml",
    data: { url: awsCartCreateUrl },
    headers:{
       'Access-Control-Allow-Origin': '*'
    },
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
