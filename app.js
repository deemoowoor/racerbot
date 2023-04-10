// Define the Phaser game configuration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false, // Set to true to enable debug information
      // Set the maximum velocity of the player
      maxVelocity: { x: 500, y: 500 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

// Define the preload function
function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('player', 'assets/player.png');
  this.load.image('boundary', 'assets/boundary.png');
}

// Define the create function
function create() {

  this.TURN_RATE = 200;
  this.ACCELERATION = 300;
  this.MAX_VELOCITY = 600;
  this.DRAG = 100;

  // Create a new TileSprite and set it as the background
  this.bg = this.add.tileSprite(0, 0, this.game.config.width * 4, this.game.config.height * 4, 'background');

  // Create a group to hold the track boundary sprites
  this.boundaryGroup = this.physics.add.staticGroup();

  // Define the track boundary coordinates
  const boundaryCoords = [
    { x: 100, y: 50 },
    { x: 200, y: 50 },
    { x: 300, y: 50 },
    { x: 400, y: 50 },
    { x: 500, y: 50 },
    { x: 600, y: 50 },
    { x: 700, y: 50 },
    { x: 750, y: 100 },
    { x: 750, y: 200 },
    { x: 750, y: 300 },
    { x: 750, y: 400 },
    { x: 750, y: 500 },
    { x: 700, y: 550 },
    { x: 600, y: 550 },
    { x: 500, y: 550 },
    { x: 400, y: 550 },
    { x: 300, y: 550 },
    { x: 200, y: 550 },
    { x: 100, y: 550 },
    { x: 50, y: 500 },
    { x: 100, y: 550 },
    { x: 50, y: 400 },
    { x: 50, y: 300 },
    { x: 50, y: 200 },
    { x: 50, y: 100 },
  ];

  // Create sprites for each boundary point and add to the group
  for (let i = 0; i < boundaryCoords.length; i++) {
    const point = boundaryCoords[i];
    const sprite = this.physics.add.sprite(point.x, point.y, 'boundary');
    this.boundaryGroup.add(sprite);
  }

  // Add rotation vector graphics object
  this.rotationVector = this.add.graphics();
  this.rotationVector.lineStyle(2, 0xffcc00);
  this.rotationVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  // Add speed vector graphics object
  this.speedVector = this.add.graphics();
  this.speedVector.lineStyle(2, 0x00ff00);
  this.speedVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  // Add acceleration vector graphics object
  this.accelerationVector = this.add.graphics();
  this.accelerationVector.lineStyle(2, 0x0000ff);
  this.accelerationVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  this.dragVector = this.add.graphics();
  this.dragVector.lineStyle(2, 0xff0000);
  this.dragVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  this.player = this.physics.add.sprite(400, 450, 'player');
  this.player.setCollideWorldBounds(true);
  this.player.angle = 90;

  this.speedText = this.add.text(590, 10, '', { font: '14px Lucida Console', color: '#333333' }).setOrigin(0);
  this.rotationText = this.add.text(590, 25, '', { font: '14px Lucida Console', color: '#333333' }).setOrigin(0);

  // Enable collision detection between the player's car and the track boundaries
  this.physics.add.collider(this.player, this.boundaryGroup, gameOver);
}
// Define the update function
function update() {

  const cursors = this.input.keyboard.createCursorKeys();
  const currentVelocity = this.player.body.velocity.length();
  this.player.body.useDamping = true;
  if (cursors.up.isDown) {
    this.physics.velocityFromAngle(this.player.body.rotation - 90, this.ACCELERATION,
      this.player.body.acceleration);
  } else if (cursors.down.isDown) {
    this.physics.velocityFromAngle(this.player.body.rotation - 90, -this.ACCELERATION,
      this.player.body.acceleration);
  } else if (currentVelocity > 0) {
    this.player.setAcceleration(0);
    this.player.body.drag.set(0.2 * Math.abs(Math.cos(this.player.body.rotation / 180 * Math.PI)));
  } else {
    this.player.setAcceleration(0);
    this.player.body.drag.set(0);
  }

  // Limit velocity to max
  if (currentVelocity > this.MAX_VELOCITY) {
    this.player.body.velocity.scale(this.MAX_VELOCITY / currentVelocity);
  }

  if (cursors.left.isDown) {
    this.player.setAngularVelocity(-this.TURN_RATE);
  } else if (cursors.right.isDown) {
    this.player.setAngularVelocity(this.TURN_RATE);
  } else {
    this.player.setAngularVelocity(0);
  }

  this.speedText.setText(`Speed: ${Math.floor(this.player.body.speed)}`);
  this.rotationText.setText(`Drag: ${this.player.body.drag.y} x ${this.player.body.drag.x}`);

  // Update rotation vector graphics
  this.rotationVector.x = this.player.x;
  this.rotationVector.y = this.player.y;
  this.rotationVector.rotation = this.player.rotation;
  this.rotationVector.scaleY = 2;

  // Update speed vector graphics
  this.speedVector.x = this.player.x;
  this.speedVector.y = this.player.y;
  this.speedVector.rotation = Math.atan2(this.player.body.velocity.y, this.player.body.velocity.x) + Math.PI / 2;
  this.speedVector.scaleY = this.player.body.speed / 100 + 1;

  // Update acceleration vector graphics
  this.accelerationVector.x = this.player.x;
  this.accelerationVector.y = this.player.y;
  this.accelerationVector.rotation = this.player.body.acceleration === 0 ? this.player.rotation : Math.atan2(this.player.body.acceleration.y, this.player.body.acceleration.x) + Math.PI / 2;
  this.accelerationVector.scaleY = Math.abs(this.player.body.acceleration.x) / 100 + Math.abs(this.player.body.acceleration.y) / 100;

  this.dragVector.x = this.player.x;
  this.dragVector.y = this.player.y;
  this.dragVector.rotation = Math.atan2(this.player.body.drag.y, this.player.body.drag.x) + Math.PI / 2;
  this.dragVector.scaleY = Math.abs(this.player.body.drag.x) / 100 + Math.abs(this.player.body.drag.y) / 100 + 2;

}

// Define the game over function
function gameOver() {
  this.physics.pause();
  this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
}