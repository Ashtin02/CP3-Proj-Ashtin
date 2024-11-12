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

getMessages();
sendMessage();

/**
 * function that will get the messages from the database and display them 
 *  in the chatbox
 */
async function getMessages(){
    let data = await fetch("/getComments");
    let messages = await data.json();
    let chatbox = document.getElementById("chatbox");

    chatbox.innerHTML = "";

    messages.forEach(({UserName, Comment, Rating, PostDate }) => { 

        let displayComment = Comment || 'No Comment Given'
        let displayRating = Rating || 'No Rating Given'
        let displayUserName = UserName || 'No UserName Given'
        let displayPostDate = PostDate || 'No Date Given'
        let messageText = `${displayUserName}: ${displayComment}      Rating: ${displayRating}      ${displayPostDate}` +" UTC";

        let message = document.createElement('p'); 
        message.classList.add('message');
        message.textContent = messageText;
        chatbox.appendChild(message);
    });
}

/**
 * Function that will take the user input and send the data to the corresponding tables in the database
 */
async function sendMessage(){ 
    let chatButton = document.getElementById("chatBtn"); 
    chatButton.addEventListener("click", async ()=>{
        let errorMessage = document.getElementById("ErrorMessage");
        let username = document.getElementById("username").value; 
        let message = document.getElementById("message").value; 
        let rating = parseInt(document.getElementById("rating").value);

        if(username && message && rating > 0 && rating < 6){
            errorMessage.innerHTML = "";
            let res = await fetch("/sendMessage", {
                method: "POST", 
                headers:{
                    "Content-Type": "application/json"
                }, 
                body: JSON.stringify({username, message, rating})
            });

            if(res.ok){
                document.getElementById("username").value = "";
                document.getElementById("message").value = "";
                document.getElementById("rating").value = "";

                getMessages();

            }else{
                errorMessage.innerHTML= "error Submitting Message";
            };

        }else{
            errorMessage.innerHTML = "Please Input a Username, Message, and Rating (within specified range) Before Submitting."
            return;
        };

    });
}


