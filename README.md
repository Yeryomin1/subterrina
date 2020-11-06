# subterrina
Simple javascript and HTML5's canvas 3D simulator game allowing you to be an iron mole driver. [View online](https://yeryomin1.github.io/subterrina/).
## Current features
* dashboard with indication of vehicle parameters:
  * roll, heading and pitch
  * power plant level 
  * speed
  * vertical speed
  * depth
  * oxygen reserve
  * fuel reserve
* warning signals with short instruction messages
* keyboard or mouse control  
Currently, only one mission is simulated. In this mission, the player docks at the Eastern gate of the Northern base.
## Controls
Two control modes of pitch and roll are supported.
### Commons controls
* W/S: Increase/Decrease throttle
* A/D: Left/Right yaw
### Mouse controls
* left/right - roll, left/right
* forward/backward - pitch, nose down/up
### Numpad controls
* '4'/'6' - roll, left/right
* '8'/'2' - pitch, nose down/up
## Physics
Obviously, there are no exact models for the game. Currently, there is no source data for creating such models. However, we can make some assumptions:
1. The mole moves in the direction of its longitudinal axis, the values of the angles of attack and sideslip are negligible.
2. The vehicle does not need lift force, such as that of an airplane wing.
## Screenshots
### General
The game as a whole looks like this.
![](images/play.gif "")
