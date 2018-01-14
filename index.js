const tastDiveUrl = "https://tastedive.com/api/similar";


function requestFromTasteKid(url, callback){
  const query = {
    q:`${$("#book-search-query").val()}`,
    type:"books",
    info: 1,
    k:"296844-TylerSti-3Q7R0SNX",
    dataType: "jsonp",
  };

  $.getJSON(tastDiveUrl, query, callback);
  console.log(`${$("#start-page-search").val()}`);
}



$(requestFromTasteKid);
