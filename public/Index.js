"use strict";

//-------------------JS FOR MEME PAGE ----------------------------

document.addEventListener("DOMContentLoaded", fetchData)

/**
 * Fetches the data from the API and instantialized the event listener button
 * 
 */
 function fetchData(){
    let button = document.getElementById("MemeButton");
    button.addEventListener("click", async () =>{
            let api = "https://api.imgflip.com/get_memes"
            fetch(api) 
                .then(statusCheck)
                .then(resp => resp.json())
                .then(ProcessData)
                .catch(handleError)
        
        
    });
   
}

/**
 * Processes the data it is given back from fetch data and uses it to caption the meme 
 * @param {Object} data -data that is retrieved from the API
 */
async function ProcessData(data){ 
    let topCaption = document.getElementById("caption0").value;
    let botCaption = document.getElementById("caption1").value;

    if(topCaption === "" || botCaption ===""){
        handleError("Please fill out both Top Section and Bottom Section before using the generate meme button.")
        return;
    }
    let memeID = data.data.memes[0].id;

    let captionMemeUrl = "https://api.imgflip.com/caption_image"


    const formData = new URLSearchParams();
    formData.append('template_id',  memeID);
    formData.append('username', 'AshRiv');
    formData.append('password', 'Riv02$00$'); 
    formData.append('text0', topCaption);
    formData.append('text1', botCaption);

    fetch(captionMemeUrl, {
        method: "POST", 
        body: formData
    })
    .then(statusCheck)
    .then(resp => resp.json())
    .then(post)
    .catch(handleError)

    document.getElementById("caption0").value = "";
    document.getElementById("caption1").value = "";

}

/**
 * 
 * @param {String} err - displays error message in meme container depending on what went wrong 
 */
async function handleError(err){
    let memeContainer = document.getElementById("MemeContainer");
    memeContainer.innerHTML = err;
}

/**
 * 
 * @param {response} response - HTTP response to check
 * @returns {response} - the status of the response
 * @throws {Error} - Error as a response text saying the status is not ok
 */
async function statusCheck(response){
if(!response.ok){
    throw new Error(await response.text());
}
return response; 
}

/**
 * posts the meme that is now captioned to the meme container 
 * @param {Object} data - data containing the url for the newly captioned meme
 */
async function post(data){
    let memeContainer = document.getElementById("MemeContainer")

    memeContainer.textContent = "Loading..."
    setTimeout(() => {
        let newImg = document.createElement("img");
        
        newImg.src = data.data.url;
        newImg.alt = "Meme"
        newImg.id = "MemePicture"

        memeContainer.textContent = "";
        memeContainer.appendChild(newImg);
},2500)
};


//-------------------JS FOR CHAT PAGE ----------------------------

//write JS but once you hit the fetch that needs somethign from app.js stop and write 
//the app.js code needed to run that fetch

async function getMessages(){
    let data = await fetch("/getComments");
    let messages = data.json();
    chatbox.innerHTML = "";
    array.forEach(({UserName, comment, Rating, PostDate }) => {
        let message = document.createElement('p'); 
        message.textContent = `${UserName}: ${comment} ${Rating} ${PostDate}`;
        chatbox.appendChild(message);
    });


}