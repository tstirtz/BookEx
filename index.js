const tasteDiveUrl = "https://tastedive.com/api/similar";


function requestFromTasteKid(searchVal, callback){
  const query = {
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k:"296844-TylerSti-3Q7R0SNX",
    dataType: "jsonp",
  };

  $.getJSON(tasteDiveUrl, query, callback);
  console.log(`${$("#start-page-search").val()}`);
}

function handleSearchButton(){
  $(".js-search-button").on("click", function(){
    let searchInputValue= this.prev().val();

    requestFromTasteKid(searchInputValue, callback);
  });
}

function renderBookSuggestions(){
  //append results to html
}

function handleNewSearch(){
  //when user inputs new search update DOM
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



$(requestFromTasteKid);
