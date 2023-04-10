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

  this.scale = 0.2;
  this.TURN_RATE = this.scale;
  this.ACCELERATION = 400 * this.scale;
  this.MAX_VELOCITY = 2000 * this.scale;
  this.wheelAngle = 0;
  this.wheelMaxAngle = 4;

  // Create a new TileSprite and set it as the background
  this.bg = this.add.tileSprite(0, 0,
    this.game.config.width * 2 / this.scale,
    this.game.config.height * 2 / this.scale, 'background').setOrigin(0.5);
  this.bg.setScale(this.scale);

  // Create a group to hold the track boundary sprites
  this.boundaryGroup = this.physics.add.staticGroup();

  // Create sprites for each boundary point and add to the group
  for (let i = 0; i < boundaryCoords.length; i++) {
    const point = boundaryCoords[i];
    const sprite = this.physics.add.sprite(point.x, point.y, 'boundary');
    sprite.setScale(this.scale);
    this.boundaryGroup.add(sprite);
  }

  this.player = this.physics.add.sprite(400, 450, 'player');
  this.player.setCollideWorldBounds(true);
  this.player.setScale(0.2);
  this.player.angle = 90;
  this.player.body.maxVelocity.set(this.MAX_VELOCITY);

  addVectorGraphics(this);
  const textStyle = {
    font: 'bold 15px sans-serif',
    stroke: '#333',
    strokeThickness: 3,
    color: '#FFFFFF'
  };
  this.speedText = this.add.text(590, 10, '', textStyle).setOrigin(0);
  this.rotationText = this.add.text(590, 25, '', textStyle).setOrigin(0);

  // Enable collision detection between the player's car and the track boundaries
  this.physics.add.collider(this.player, this.boundaryGroup, gameOver);
}

// Define the update function
function update() {

  const cursors = this.input.keyboard.createCursorKeys();
  
  handleVelocityAndAcceleration(this, cursors);
  handleWheelTurning(this, cursors);

  handleGauges(this);
  
  handleVectorGraphics(this);
}

function handleVelocityAndAcceleration(scene, cursors) {
  const currentVelocity = scene.player.body.velocity.length();
  scene.player.body.useDamping = true;
  scene.player.body.drag.set(0.3);

  const playerRotRad = Phaser.Math.DegToRad(scene.player.body.rotation - 90);
  
  scene.physics.velocityFromRotation(playerRotRad,
    currentVelocity,
    scene.player.body.velocity);
  
  if (cursors.up.isDown) {
    scene.physics.velocityFromRotation(playerRotRad,
      scene.ACCELERATION,
      scene.player.body.acceleration);
  } else if (cursors.down.isDown) {
    // braking puts double the max acceleration
    scene.physics.velocityFromRotation(playerRotRad,
      -scene.ACCELERATION * 2,
      scene.player.body.acceleration);
  } else if (currentVelocity > 0) {
    scene.player.setAcceleration(0);
  } else {
    scene.player.setAcceleration(0);
  }

  // Limit velocity to max
  if (currentVelocity > scene.MAX_VELOCITY) {
    scene.player.body.velocity.scale(scene.MAX_VELOCITY / currentVelocity);
  }
}

function handleWheelTurning(scene, cursors) {
  if (cursors.left.isDown) {
    scene.wheelAngle = Math.max(-scene.wheelMaxAngle, scene.wheelAngle - scene.TURN_RATE);
  } else if (cursors.right.isDown) {
    scene.wheelAngle = Math.min(scene.wheelMaxAngle, scene.wheelAngle + scene.TURN_RATE);
  } else {
    scene.wheelAngle = scene.wheelAngle / 2;
  }

  scene.player.angle += scene.wheelAngle / 2;
}

function handleGauges(scene) {
  scene.speedText.setText(`Speed: ${Math.floor(scene.player.body.speed)}`);
  scene.rotationText.setText(`Rotation babee!`);

}

function addVectorGraphics(scene) {

  // Add rotation vector graphics object
  scene.rotationVector = scene.add.graphics();
  scene.rotationVector.lineStyle(2, 0xffcc00);
  scene.rotationVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  // Add speed vector graphics object
  scene.speedVector = scene.add.graphics();
  scene.speedVector.lineStyle(2, 0x00ff00);
  scene.speedVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));

  // Add acceleration vector graphics object
  scene.accelerationVector = scene.add.graphics();
  scene.accelerationVector.lineStyle(2, 0x0000ff);
  scene.accelerationVector.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, -50));
}

function handleVectorGraphics(scene) {

  // Update rotation vector graphics
  scene.rotationVector.x = scene.player.x;
  scene.rotationVector.y = scene.player.y;
  scene.rotationVector.rotation = scene.player.rotation;
  scene.rotationVector.scaleY = 2;

  // Update speed vector graphics
  scene.speedVector.x = scene.player.x;
  scene.speedVector.y = scene.player.y;
  scene.speedVector.rotation = Math.atan2(scene.player.body.velocity.y, scene.player.body.velocity.x) + Math.PI / 2;
  scene.speedVector.scaleY = scene.player.body.speed / 100;

  // Update acceleration vector graphics
  scene.accelerationVector.x = scene.player.x;
  scene.accelerationVector.y = scene.player.y;
  scene.accelerationVector.rotation = scene.player.body.acceleration === 0 ? scene.player.rotation : Math.atan2(scene.player.body.acceleration.y, scene.player.body.acceleration.x) + Math.PI / 2;
  scene.accelerationVector.scaleY = Math.abs(scene.player.body.acceleration.length()) / 100;// + Math.abs(scene.player.body.acceleration.y) / 100;

}

// Define the game over function
function gameOver() {
  this.physics.pause();
  this.add.text(400, 300, 'GAME OVER', { fontSize: '64px', color: '#ff0000' }).setOrigin(0.5);
}