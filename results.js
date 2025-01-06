const app = {}

app.apiKey = "895ae8d4-9faf-4e70-940e-f5f7429224ec"
app.url = new URL("https://jooble.org/api/")
app.headers = {
    'Content-Type': 'application/json'
}

app.targetElements = () => {
    app.searchKeyword = localStorage.getItem("keywords") // gets the keyword from the local window storage that was saved in the index.html file
    app.searchLocation = localStorage.getItem("location")  // gets the location from the local window storage that was saved in the index.html file
    app.searchBtn = document.querySelector(".searchBtn")
    app.jobResults = document.querySelector(".jobResults")
    app.totalArrayItemsPerPage = 20 // the api provides array of 20 jobs per page and the total job results can be well over 100 depending on the job
    app.totalPagesToShow = 10 // so in total, for any job search we will show a maximum of 20 * 10 jobs
}


app.getTotalPages = () =>{ // gets the total job results to show
    
    app.searchParams = {
        keywords : app.searchKeyword,
        location : app.searchLocation,
        page : 1,
    }
    
    return app.fetchData(app.searchParams).then(data => {
        const totalJobResults = data.totalCount
        let totalPagesReal = Math.floor(totalJobResults / app.totalArrayItemsPerPage) + 1
        if (totalPagesReal > app.totalPagesToShow){
            totalPagesReal = app.totalPagesToShow // limit maximum pages to 10
        }
        
        return {
            pages : totalPagesReal,
            results : totalJobResults
        }
    }) 

}

app.getJobData = async() => { //retrieves the actual job data
    // const titleTag = app.searchKeyword.split(" ")[0]

   const totalPages = await app.getTotalPages()
  
    const allJobs = []

    for (let i = 1; i <= totalPages.pages; i++) {
        app.searchParams.page = i // switch pages (from page one all to a max of page 10)
        const data = await app.fetchData(app.searchParams) // get the 20 job items from each page (from page one all to a max of page 10)
        allJobs.push(...data.jobs)
    }
    return {
        jobs : allJobs,
        jobsCount : totalPages.results
    }
}

app.populateAllResults = () =>{// displays the data on the webpage
    const titleTagText = app.searchKeyword.split(" ")[0]
    app.getJobData().then(data => {
        console.log(data)
        app.showJobResults(data.jobs,titleTagText,data.jobsCount) //populates all the data
    })
} 

app.fetchData = (params) =>{ //place holder function that runs the api calls
    return fetch(app.url + app.apiKey, 
        { 
            headers: app.headers,
            method: "POST",
            body: JSON.stringify(params),
       }
       ).then(result => {
        return result.json() 
    })
}

app.populateEachResult = (data, nameTag) => { // place holder function that generates the card (div) that holds the data of a particular result

    
    const outterJobCard = document.createElement("div")
    const jobLink = data.link
    outterJobCard.classList.add("jobCard")
    outterJobCard.onclick = () => window.open(jobLink, "_blank");

    const jobCardHeader = document.createElement("div")
    jobCardHeader.classList.add("jobHeader")

    const jobTitle = document.createElement("h3")
    jobTitle.classList.add("jobTitle")
    jobTitle.textContent = data.title

    const jobSnippet = document.createElement("p")
    jobSnippet.classList.add("jobSnippet")
    jobSnippet.innerHTML = data.snippet

    jobCardHeader.append(jobTitle , jobSnippet)

    const jobTags = document.createElement("div")
    jobTags.classList.add("jobTags")

    const titleTagSpan = document.createElement("span")
    titleTagSpan.classList.add("tag" , "title")
    titleTagSpan.textContent = nameTag

    const durationTag = document.createElement("span")
    durationTag.classList.add("tag", "duration")
    durationTag.textContent = data.type.split("-").join(" ")

    jobTags.append(titleTagSpan, durationTag)

    const jobCardFooter = document.createElement("div")
    jobCardFooter.classList.add("jobFooter")

    const companyInfo = document.createElement("div")
    companyInfo.classList.add("companyInfo")

    const companyName = document.createElement("p")
    companyName.classList.add("companyName")
    companyName.textContent = data.company

    const companyLocation = document.createElement("p")
    companyLocation.classList.add("jobLocation")
    const companyLocationIcon = document.createElement("i")
    companyLocationIcon.className = "bx bx-map icon"
    companyLocation.appendChild(companyLocationIcon);

    const locationText = document.createTextNode(" " + data.location);
    companyLocation.appendChild(locationText);


    const postDate = document.createElement("p")
    postDate.classList.add("postDate")
    const postDateIcon = document.createElement("i")
    postDateIcon.className = "bx bx-time icon"
    postDate.appendChild(postDateIcon)

    // calculate the day job was updated
    const postDateRaw = new Date(data.updated)
    const currentDate = new Date()
    let diffBtWPostDateAndCurrDate = currentDate - postDateRaw // the difference in milliseconds
    diffBtWPostDateAndCurrDate = diffBtWPostDateAndCurrDate / (1000 * 60 * 60 * 24) // 60 secs * 60 mins * 24 hrs gives the total secs in a day then *  1000 to convert to millisecs then divide by the difference to get the actual day
    const dayUpdated = Math.floor(diffBtWPostDateAndCurrDate ) // to handle decimals
    // if (dayUpdated <= 0){
    //     console.log(diffBtWPostDateAndCurrDate)
    // }

    const postDateText = document.createTextNode(" " + `${dayUpdated} days ago`)
    postDate.appendChild(postDateText)

    companyInfo.append(companyName, companyLocation , postDate)

    const jobSource = document.createElement("div")
    jobSource.classList.add("jobLogo")
    const jobSourceText = document.createElement("h5")
    jobSourceText.textContent = data.source

    jobSource.appendChild(jobSourceText)

    jobCardFooter.append(companyInfo, jobSource)

    outterJobCard.append(jobCardHeader, jobTags , jobCardFooter)
    return outterJobCard
}   

app.showJobResults = (data, titleTag, totalResults) => { // placeholder function that generates all the job result cards
    let location = ""
    if (app.searchLocation === undefined || app.searchLocation === "" || data.length <=0){
        location = ``
    }else{
        location = `in ${app.searchLocation}`
    }
    const resultsHeading = document.createElement("h2")
    resultsHeading.textContent = `${app.searchKeyword} jobs ${location}`

    const totalVacancies = document.createElement("p")
    totalVacancies.textContent = `${totalResults} vacancies`

    app.jobResults.append(resultsHeading, totalVacancies)

    if (data.length > 0 ){
        for (let i = 0; i < data.length; i++){
            const jobResultCard = app.populateEachResult(data[i], titleTag)
            app.jobResults.appendChild(jobResultCard)
        }
    }else{
        alert("No job found for the search entry. Please try again with a more specific entery ,e.g., toronto,ON instead of just toronto.")
    }
}


app.init = () => {
    app.targetElements();
    app.populateAllResults()
};


if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', app.init)
}else {
    app.init()
}