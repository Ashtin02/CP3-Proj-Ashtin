# ChatBox API Documentation
The Chatbox API is an application that can let users post comments, reviews, or additions and then retreive them from a database. 

## Gets all the messages currently in the database
**Request Format:** /getComments

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Fetches all the comments in the database and connects them to their User, rating and post date.

**Example Request:** /getComments

**Example Response:**

```
[
    {UserName: "Ashtin", Comment: "hello", Rating: 5, PostDate: "2024-11-12 19:32:37"}

    {UserName: "Janna", Comment: "So cool", Rating: 5, PostDate: "2024-11-12 19:32:49"} 

    {UserName: "Luke", Comment: "Wow, interesting website!", Rating: 5, PostDate: "2024-11-12 23:37:18"}
]

```

**Error Handling:**
If there is a problem getting the comments the API returns a 500 error with this message 

{
    "error": "Error getting comments 
}

## Sending a new message
**Request Format:** /sendMessage

**Request Type:** POST

**Returned Data Format**: JSON

**Description:** *Adds a new message to the database. Also adds the User to the user table if not already in there. As well as adding the rating to the Rating table. Parameters are `username`, `message`, and `rating`.

**Example Request:** /sendMessage with POST parameters of `username = Ashtin`, `message = hello`, and `Rating = 5`

**Example Response:**

```json
{
"message": "Comment and rating saved successfully"
}
```

**Error Handling:**
Possible 400 if client doesnt give any of the fields ( username, message, rating).

