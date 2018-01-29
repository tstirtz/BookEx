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
        $(".js-book-suggestions").append(`<p>Sorry, we could't find anything related to "${searchInputValue}". Check spelling or try another book.</p>`);
      }else {
        $(".js-suggestions-header").prepend(`<h2>Books related to "${searchInputValue}"</h2>`);
        console.log(json.Similar.Results);

        handleSuggestionClick(json);

        const resultItems = json.Similar.Results.map(function(result, index){

          const bookSuggestionName = result.Name;
          const bookSynopsis = result.wTeaser;
          const removeComma = bookSuggestionName.replace(/\'/, '');
          const encBookName = encodeURIComponent(removeComma);
          console.log(index);

          console.log(encBookName);

          requestFromGoogleBooks(bookSuggestionName, function(resultObj){
            console.log("start of requestFromGoogleBooks working");
            console.log(resultObj);
            console.log("end of requestFromGoogleBooks working");




            $(".js-book-suggestions").append(
              `<div class="result-item">
                <a href="#" class="${index} book-title" id=     "${encBookName}"><p>${bookSuggestionName}</p></a>
                 <a href="#" class="${index} book-cover-link" id= "${encBookName}"><img src="${resultObj['items'][0]['volumeInfo']['imageLinks']['smallThumbnail']}" class = "cover-image" alt= "Image of the book cover of ${bookSuggestionName}"></a>
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
  console.log("end of handleSearchButton working");
}




function handleNewSearch(){
  $(".js-suggestions-header").empty();
  $(".js-book-suggestions").empty();
  $(".js-price-container").empty();
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
    let title = tasteDiveObj["Similar"]["Results"][clickedBook]["Name"];

    $(".js-book-suggestions").append(
      `<h2>${title}</h2>
      <p>${synopsis}</p>`);

    console.log("end of handleSuggestionClick working");
  });
}




function getPricesOfClickedBook(amazonData){
    console.log("start of getPricesOfClickedBook working");

    //Check if browser is Chrome
    if(navigator.userAgent.indexOf("Chrome") > -1){
      let allOffersUrlChrome = amazonData.getElementsByTagName("ItemLinks")[0].childNodes[6].childNodes[1].childNodes[0].nodeValue;
        console.log("-----------------");
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
  console.log(pricesUrl);

  $.ajax({
    url: "https://rift-lycra.glitch.me/postmedata",
    type: 'GET',
    // contentType: "text/plain; charset=utf-8",
    // dataType: 'text',
    data: {url: pricesUrl},
    // processData: false,
    success: function(data){

      parser= new DOMParser();
      htmlDoc = parser.parseFromString(data, 'text/html')
      console.log(htmlDoc);

      $(".js-price-container").empty();
      $(".js-price-container").prepend(
        `<header role= "navigation" class= "prices-header"
            <h3>Used Book Prices</h3>
         </header>`);

      //retrieve price of used books
      let priceInfo= htmlDoc.getElementsByClassName("olpOfferPrice");
      $.each(priceInfo, function(index, value){

        let bookPrices = priceInfo[index]['innerHTML'];
        $(".js-price-container").append(
          `<div class= "${index}">
            <span>${bookPrices}</span>
          </div>`
        );
      });

      //retrieve shipping cost info
      let shippingData= htmlDoc.getElementsByClassName("olpShippingInfo");
      $.each(shippingData, function(index){
        let shippingCost = shippingData[index]['firstChild']['nextElementSibling']['children'][0]['innerText'];

        $(`.${index}`).append(`<span>Shipping: ${shippingCost}</span>`);
      });

      //retrieve shipping dates
      let shippingDates= htmlDoc.getElementsByClassName("olpAvailabilityExpander");
      $.each(shippingDates, function(index){
        let estimatedShipping = shippingDates[index]['children'][0]['childNodes'][2]['data'];


        $(`.${index}`).append(`<span> Estimated Shipping Date ${estimatedShipping}</span>`);
      });

      //retrieve seller name
      let getSellerInfo = htmlDoc.getElementsByClassName("olpSellerColumn");
      console.log(getSellerInfo)
      $.each(getSellerInfo, function(index){

          let sellerName = getSellerInfo[index]['childNodes'][1]['childNodes'][1]['childNodes'][1]['childNodes'][0]['nodeValue'];

          console.log(sellerName);

          let sellerRating = getSellerInfo[index]['childNodes'][3]['childNodes'][3]['childNodes'][0]['innerText'];

          console.log(sellerRating);

          $(`.${index}`).append(`<span>${sellerName}</span><span>Seller Rating: ${sellerRating}</span>`);

      });

      //get the offer ID's for the used book offers
      let offerIds = htmlDoc.getElementsByName("offeringID.1");
      $.each(offerIds, function(index, value){


        let offerIdValue = offerIds[index]['value'];


        $(`.${index}`).append(`<a href = "#" type="button" class= "js-purchase-book-${index}" id="${offerIdValue}" >Buy Off Amazon</button></a>`);

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
  console.log("buy button click function working");
  $('.js-sale-info').on('click', `.js-purchase-book-${index}`, function(){
    console.log("buy button click function working");
    let offerId = $(this).attr("id");

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
      $(".js-book-suggestions").append("Sorry there was an error: " + typeOfError);
    },
    data:{
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k: keys.tasteDive,
    verbose: 1,
    crossDomain: true,
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
AWSAccessKeyId=${keys.amazonWebServicesAccessKeyId}&AssociateTag=tswebdev-20&Condition=Used&Keywords=${suggestionTitle}&Operation=ItemSearch&ResponseGroup=ItemAttributes%2COffers%2COfferSummary&SearchIndex=Books&Service=AWSECommerceService&Sort=relevancerank&Timestamp=${encodedUtcDate}&Title=${suggestionTitle}`;//Do not tab this string template over!


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
