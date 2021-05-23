## cryptochat
Cryptochat is a React web application that allows you to chat with other people under an alias in a live chat about everything crypto. 

## File Structure
This is the current file structure of the project. 
```
📦cryptochat
┣ 📂node_modules
┣ 📂public
┣ 📂src
┃ ┣ 📂components
┃ ┃ ┣ 📜alias.js
┃ ┃ ┗ 📜footer.js
┃ ┣ 📂styles
┃ ┃ ┗ 📜app.css
┣ 📜app.js
┣ 📜index.css
┣ 📜package.json
┣ 📜README.md
```
## Back End
All back end is managed via Google Firebase using a real time database to fetch and create the chats that users send. Using a NoSQL backend solution its much easier to manage a live chat without the need for an API. This overall makes the webpage much more responsive and as light weight as possible. 