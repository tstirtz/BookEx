/// <reference types="aws-sdk" />
const tasteDiveUrl = "https://tastedive.com/api/similar";
const googleBooksUrl = "https://www.googleapis.com/books/v1/volumes";
const amazonProductAddUrl ="http://webservices.amazon.com/onca/xml";
let googleKey = keys.googleBooks;
let tasteKey = keys.tasteDive;

function handleSearchButton(){
  console.log("start of handleSearchButton working");
  $(".js-search-button").on("click", function(){
    handleNewSearch();
    let searchInputValue= $(this).prev().val();

    console.log(searchInputValue);


    requestFromTasteKid(searchInputValue, function(obj){

      console.log(obj);

      if(obj.Similar.Results.length === 0){
        $(".js-main").append(`<p>Sorry, there are no results for ${searchInputValue}</p>`);
      }else {

        console.log("if statement working");
        console.log("Related book suggestions from TasteDive" + obj.Similar.Results);

        const resultItems = obj.Similar.Results.map(function(result){

          const bookSuggestionName = result.Name;
          const removeComma = bookSuggestionName.replace(/\'/, '');
          const encBookName = encodeURIComponent(removeComma);


          requestFromGoogleBooks(bookSuggestionName, function(resultObj){
            console.log(resultObj);

            requestFromAmazonProdAdd(encBookName, function(requestObj){
              console.log(requestObj);

            });


            $(".js-book-suggestions").append(
              `<a href="#"><p>${bookSuggestionName}</p></a>
               <a href="#"><img src="${resultObj['items'][0]['volumeInfo']['imageLinks']['smallThumbnail']}"></a>
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
}

function clearSearchInput(){
  $(".js-book-search-input").val('');
}

function handleSuggestionClick(){
  //book suggestion is clicked
}

function requestForPrices(){
  //when book suggestion is clicked make call to Direct Textbook api
}

function renderPriceComparisons(){
  //update DOM with prices comparisons
}

function requestFromTasteKid(searchVal, callback){
//Next Step: set an environment variable for api keys

  const settings = {
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k: tasteKey,
    dataType: "jsonp",
    verbose: 1,
    crossDomain: true,
    limit: 10
  };

  $.getJSON(tasteDiveUrl, settings, callback).fail(function(){
    console.log(`request failed`);
    $(".js-main").append("Sorry, your search failed. Please try again.");
  });
}

function requestFromGoogleBooks(searchVal, callback){
  //make call to Google Books api to get book cover images
  console.log(searchVal);
  const requestSetting={
    q: `${searchVal}`,
    intitle: `${searchVal}`,
    key: googleKey,
    //orderBy: "relevance",
    maxResults: 1
  };

  $.getJSON(googleBooksUrl, requestSetting, callback);

}

function requestFromAmazonProdAdd(suggestionTitle, callback){

  let dt = new Date();
  let dateISO = (dt.toISOString());
  let dateMinusMilliSec = dateISO.replace(/\.[0-9]{3}/, '');
  let encodedUtcDate = encodeURIComponent(dateMinusMilliSec);

  console.log("encoded time stamp = " + encodedUtcDate);

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
    success: callback
  });
}






$(handleSearchButton);
