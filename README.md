# subterrina
Simple javascript and HTML5's canvas 3D simulator game allowing you to be an iron mole driver. The project uses three-dimensional graphics of [three.js](https://github.com/mrdoob/three.js) library and controls of [dat.GUI](https://github.com/dataarts/dat.gui) library.
[View online](https://yeryomin1.github.io/subterrina/).
## Current features
* Head-Up Display with indication of vehicle parameters:
  * roll
  * pitch
  * heading
  * depth
* keyboard control
### Controls
* '4'/'6': roll, left/right
* W/S: pitch, nose down/up
* A/D: Left/Right yaw
### HUD attitude
The artificial horizon indicator works on the principle of a fixed earth. This means that the horizon line remains stationary while the vehicle symbol rotates relative to it.
## Physics
Obviously, there are no exact models for the game. Currently, there is no source data for creating such models. However, we can make some assumptions:
1. The mole moves in the direction of its longitudinal axis, the values of the angles of attack and sideslip are negligible.
2. The vehicle does not need lift force, such as that of an airplane wing. This statement is less obvious than the first one. Let's say that the mole is more of a submarine than an airplane.
