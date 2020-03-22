# WirvsVirus Hackathon 2020 - Movement Arcade
Website and code for our project "Movement Arcade" which has been created in the WirvsVirusHackathon 2020 <br>
Authors: **_Annika Heil, Max Schröder, Yerso Checya Sinti, Julian Roth_**

## Inspiration
The unprecedented, surprising, world wide success of the flappy bird game indicates the huge potential for its use in making people move while stuck at home. Then, while brainstorming, we thought of other games, which could offer engaging gameplay, encouraging users to move more.
## What it does
We use a webcam to track a persons movement. Then from the persons pose we derive the inputs for our different games.
![alt text](https://github.com/mathmerizing/wirvsvirus/blob/gh-pages/res/how_it_works.jpg)
## How we built it
Using javascript we rebuilt the well known games of **pong, space invaders** and  **flappy birds**. Then using the PoseNet neural network and the users webcam, we detect their position relative to the camera. From this position, we derive inputs for our games, thus allowing the user to play our games using their movements.
## Challenges we ran into
One major problem in our overall workflow was definitely communication. We tried organizing via discord, which worked great at times, but connectivity issues would bring our collaboration to a halt. Furthermore not all team members were optimally equipped with good microphones, headsets and cameras, which made communication more tedious than it would have been, if we sat next to each other.
Regarding the application development process itself, minor problems occurred when we tried using posenet in order to scan the poses of more than one person. Also some typical problems like designing a good hitbox detection came to play.
## Accomplishments that we're proud of
The accuracy of the input we obtained from using posenet, was definitly a huge accomplishment for us. Also prototyping 3 different games within a span of less than 48 hours made us very proud.
## What we learned
In recent years, artificial intelligence has improved to such a degree, where open source ready to use models provide an astonishing degree of accuracy and functionality. Using such technologies, offers a great potential for very engaging and creative applications.
## What's next for movement-arcade
Definitely more play testing needs to be done, as the adaptation to a new control scheme changes aspects of how we enjoy these games, space invaders especially. Though there is huge potential, adapting the base gameplay loop itself, will probably increase the enjoyment of players a lot.
## Currently available games
<h3> Flappy Squats </h3>
<p align="center">
  <img src="https://github.com/mathmerizing/wirvsvirus/blob/gh-pages/res/Screenshot_flappy_squats.png">
</p>
<h3> Space Invaders </h3>
<p align="center">
  <img src="https://github.com/mathmerizing/wirvsvirus/blob/gh-pages/res/Screenshot_space_invaders.png">
</p>
<h3> Pong </h3>
<p align="center">
  <img src="https://github.com/mathmerizing/wirvsvirus/blob/gh-pages/res/Screenshot_pong.png">
</p>
