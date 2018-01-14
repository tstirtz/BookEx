const tasteDiveUrl = "https://tastedive.com/api/similar";

function handleSearchButton(){
  console.log("start of handleSearchButton working");
  $(".js-search-button").on("click", function(){

    let searchInputValue= $(this).prev().val();

    console.log(searchInputValue);

    requestFromTasteKid(searchInputValue, function(obj){
      console.log(obj.similar.info.results);
      if(obj.similar.length() === 0){
        $(".js-main").append(`<p>Sorry, there are no results for ${searchInputValue}</p>`);
      }else{
        const results = $(data.similar.info.results).map(function(result){
          return result;
        });

        $(".js-main").append(
          `<aside role="region">
            <p>${results}</p>
          </aside>`
        );
      }
    });
  });
  console.log("end of handleSearchButton working");
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

function requestFromTasteKid(searchVal, callback){
  const query = {
    q:`${searchVal}`,
    type:"books",
    info: 1,
    k:"296844-TylerSti-3Q7R0SNX",
    dataType: "jsonp",
  };

  $.getJSON(tasteDiveUrl, query, callback);
  console.log(`${searchVal}`);
}



$(handleSearchButton);
