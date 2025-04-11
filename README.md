# SOEN341-Project

Team members:
- xJennaS | Jenna Sidi Abed (40280128) 
- Steven01231 | Steven Dy (40283742)
- Adriana643 | Adriana Ruscitti-Titto (40239627)
- jinglebell55555 | Jing-Ning Chen (40281215)
- xidxnx | Aidana Abdybaeva (40281501)
- draya | Andrea Nicole Torres (40289711)
- LEMMYYYYY | Remi Cardinal Jubinville (40228517)
- ibti-m | Ibtihal Mossa (40239097)

Description:
This project implements a platform where users can communicate in an individual and group manner. Users are allowed to message people privately (1-on-1) and to create a group channel for people or friends to communicate with one another. Other features will be added for users' entertainment. 

Objective:

The group will be implementing 3 core features that the customers are requiring to use:

- Website UI/UX Layout
- User/System Actions
- Role-Based Channel Permissions
  
Languages and Techniques:

For this project, we will be using HTML, CSS, and JavaScript to create a responsive and visually appealing UI/UX layout. The front end will be built with React.js, allowing for a dynamic and interactive user experience. For the backend, we will use Supabase as our database and authentication provider, enabling real-time messaging and efficient data storage. Additional techniques such as role-based access control will be implemented to manage channel permissions, ensuring secure and structured communication within the platform.

## Setting up project

To install all the dependencies, run the following commands:

`npm install`

To connect to database:

Create `.env` file in `src\backend`. 
Copy API key from database onto file.

E.g. `SUPABASE_KEY="insert api key here"`
Copy database url from database onto file.
E.g. `SUPABASE_URL="insert url here"`

### Additional information

This section explains why the following packages/modules are used.

<b>Node</b>: Important to download to use `npm` commands.
Follow this tutorial for installation: https://www.youtube.com/watch?v=06X51c6WHsQ

<b>Cors</b>: Allows to run two hosts at the same time. The backend and frontend will run on two hosts since we're using React and Node.

<b>React</b>: Frontend library.

<b>Dotenv</b>: Allows a safe storage location for important variables such as API keys.

<b>Express</b>: This is used to connect the frontend to the backend.

++++++++ BONUS FEATURE ++++++++++

Exhibit is a feature that allows users to share their artworks or pictures 
Users can:
- Post their artworks by uploading images and writing a description
- View other user's posts
- Like and comment on posts
- See the number of likes and comments on each post
  
