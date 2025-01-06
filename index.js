const searchKeyword = document.querySelector("#searchKeyword")
const searchLocation = document.querySelector("#searchLocation")

document.querySelector(".searchBtn").addEventListener("click", (e) => {
    e.preventDefault()
    // console.log("hello")
    // app.searchResultsUrl = new URL("search_results.html", window.location.origin)
    localStorage.setItem("keywords", searchKeyword.value)
    localStorage.setItem("location", searchLocation.value)

    // Redirect to the search results page
    window.location.href = "search_results.html"
})
    
