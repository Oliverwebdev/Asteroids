const canv = document.getElementById("game-board");
const ctx = canv.getContext("2d");

// canv.width = window.innerWidth;
// canv.height = window.innerHeight;

const fps = 30;
// Die Anzahl der Frames pro Sekunde im Spiel. Bestimmt die Aktualisierungsrate des Spiels.

const friction = 0.7;
// Der Reibungskoeffizient des Raumschiffs. Beeinflusst die Verlangsamung des Raumschiffs, wenn keine Tasten gedrückt werden.

const gameLives = 3;
// Die Anzahl der Leben, die der Spieler zu Beginn des Spiels hat.

const laserDist = 0.6;
// Die maximale Reichweite des Lasers in Bezug auf die Größe des Bildschirms.

const laserExplodeDur = 0.1;
// Die Dauer der Explosion, wenn ein Laser ein Objekt trifft.

const laserMax = 10;
// Die maximale Anzahl von Laserstrahlen, die gleichzeitig auf dem Bildschirm sein können.

const laserSpd = 500;
// Die Geschwindigkeit, mit der der Laser sich bewegt.

const roidJag = 0.4;
// Die Unregelmäßigkeit der Asteroidenformen. Beeinflusst ihre Ecken und Kanten.

const roidPtsLge = 20;
// Die Punktzahl, die der Spieler für das Zerstören eines großen Asteroiden erhält.

const roidPtsMed = 50;
// Die Punktzahl, die der Spieler für das Zerstören eines mittelgroßen Asteroiden erhält.

const roidPtsSml = 100;
// Die Punktzahl, die der Spieler für das Zerstören eines kleinen Asteroiden erhält.

const roidNum = 3;
// Die Anfangsanzahl der Asteroiden im Spiel.

const roidSize = 100;
// Die Größe der Asteroiden in Pixeln.

const roidSpd = 50;
// Die durchschnittliche Geschwindigkeit der Asteroiden.

const roidVert = 10;
// Die Anzahl der Ecken oder Vertices der Asteroiden. Beeinflusst ihre Form.

const saveKeyScore = "highscore";
// Der Schlüssel, unter dem die höchste Punktzahl im lokalen Speicher gespeichert wird.

const shipBlinkDur = 0.1;
// Die Dauer, für die das Raumschiff nach einer Kollision blinkt.

const shipExplodeDur = 0.3;
// Die Dauer der Explosion, wenn das Raumschiff zerstört wird.

const shipInvDur = 3;
// Die Dauer der Unverwundbarkeit des Spielers nach einer Kollision.

const shipSize = 30;
// Die Größe des Raumschiffs in Pixeln.

const shipThrust = 5;
// Die Beschleunigung des Raumschiffs bei Anwendung von Schub.

const shipTurnSpd = 360;
// Die Geschwindigkeit, mit der das Raumschiff gedreht werden kann, in Grad pro Sekunde.

const showBounding = false;
// Legt fest, ob die Begrenzungsrahmen für Objekte angezeigt werden sollen.

const showCentreDot = false;
// Legt fest, ob ein zentrales Punktmarkierung für Objekte angezeigt werden soll.

const musicOn = true;
// Legt fest, ob die Hintergrundmusik abgespielt werden soll.

const soundOn = true;
// Legt fest, ob Spielsounds abgespielt werden sollen.

const textFadeTime = 2.5;
// Die Zeit in Sekunden, die benötigt wird, um den Text im Spiel verblassen zu lassen.

const textSize = 40;
// Die Schriftgröße für den im Spiel angezeigten Text.

// Soundeffekte einrichten
const fxExplode = new Sound("sounds/explode.m4a");
// Der Soundeffekt für die Explosion von Objekten.

const fxHit = new Sound("sounds/hit.m4a", 5);
// Der Soundeffekt für den Treffer von Objekten. Die Zahl 5 gibt die maximale Anzahl gleichzeitig spielbarer Instanzen an.

const fxLaser = new Sound("sounds/laser.m4a", 5, 0.5);
// Der Soundeffekt für das Abschießen des Laserstrahls. Die Zahl 5 gibt die maximale Anzahl gleichzeitig spielbarer Instanzen an,
// und 0.5 ist die Lautstärke des Sounds (zwischen 0 und 1).

const fxThrust = new Sound("sounds/thrust.m4a");
// Der Soundeffekt für den Schub des Raumschiffs.

// Musik einrichten
const music = new Music("sounds/music-low.m4a", "sounds/music-high.m4a");
// Die Hintergrundmusik. Die ersten und zweiten Parameter sind die Dateipfade für die Musik in niedriger und hoher Qualität.

let roidsLeft, roidsTotal;
// roidsLeft: Die Anzahl der verbleibenden Asteroiden im Spiel.
// roidsTotal: Die Gesamtanzahl der Asteroiden im Spiel.

const localFont = "DejaVu Sans Mono";

// Spieleinstellungen einrichten
let level, lives, roids, score, scoreHigh, ship, text, textAlpha;
newGame();
// level: Das aktuelle Level des Spiels.
// lives: Die Anzahl der verbleibenden Leben des Spielers.
// roids: Ein Array, das die Asteroiden im Spiel enthält.
// score: Die aktuelle Punktzahl des Spielers.
// scoreHigh: Die höchste erreichte Punktzahl im Spiel.
// ship: Das Raumschiff des Spielers.
// text: Der angezeigte Text im Spiel, z.B., "Game Over".
// textAlpha: Der Alpha-Wert (Transparenz) des angezeigten Texts.

// Event-Handler einrichten
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);
// Die Funktionen keyDown und keyUp werden aufgerufen, wenn eine Taste gedrückt oder losgelassen wird.

// Spiele-Schleife einrichten
setInterval(update, 1000 / fps);
// Die Funktion update wird mit der Bildwiederholungsrate (fps) aufgerufen, um das Spiel zu aktualisieren.

function createAsteroidBelt() {
  roids = [];
  roidsTotal = (roidNum + level) * 7;
  roidsLeft = roidsTotal;
  let x, y;
  for (let i = 0; i < roidNum + level; i++) {
    do {
      x = Math.floor(Math.random() * canv.width);
      y = Math.floor(Math.random() * canv.height);
    } while (distBetweenPoints(ship.x, ship.y, x, y) < roidSize * 2 + ship.r);
    // Solange ein neuer Asteroid innerhalb des Raumschiff-Radius generiert wird, wird erneut versucht.
    roids.push(newAsteroid(x, y, Math.ceil(roidSize / 2)));
    // Ein neuer Asteroid wird dem roids-Array hinzugefügt.
  }
}
// createAsteroidBelt erstellt eine Anzahl von Asteroiden basierend auf dem aktuellen Level und roidNum.

function destroyAsteroid(index) {
  const x = roids[index].x;
  const y = roids[index].y;
  const r = roids[index].r;

  // Punkte vergeben und neue Asteroiden erstellen, basierend auf der Größe des zerstörten Asteroiden
  if (r === Math.ceil(roidSize / 2)) {
    roids.push(newAsteroid(x, y, Math.ceil(roidSize / 4)));
    roids.push(newAsteroid(x, y, Math.ceil(roidSize / 4)));
    score += roidPtsLge;
  } else if (r === Math.ceil(roidSize / 4)) {
    roids.push(newAsteroid(x, y, Math.ceil(roidSize / 8)));
    roids.push(newAsteroid(x, y, Math.ceil(roidSize / 8)));
    score += roidPtsMed;
  } else {
    score += roidPtsSml;
  }

  // Überprüfen, ob die erreichte Punktzahl die bisherige Bestleistung übertrifft und sie im lokalen Speicher speichern
  if (score > scoreHigh) {
    scoreHigh = score;
    localStorage.setItem(saveKeyScore, scoreHigh);
  }

  // Den zerstörten Asteroiden aus dem Array entfernen, Sound abspielen und die Anzahl der verbleibenden Asteroiden reduzieren
  roids.splice(index, 1);
  fxHit.play();
  roidsLeft--;

  // Überprüfen, ob alle Asteroiden zerstört wurden, um zum nächsten Level zu wechseln
  if (roids.length === 0) {
    level++;
    newLevel();
  }
}
// Die Funktion destroyAsteroid wird aufgerufen, wenn ein Asteroid zerstört wird. Sie aktualisiert die Punktzahl, erstellt neue Asteroiden,
// spielt den Zerstörungssound ab und prüft, ob das Level abgeschlossen wurde.

function distBetweenPoints(x1, y1, x2, y2) {
  // Berechnet den Abstand zwischen zwei Punkten im Raum.
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function drawShip(x, y, a, colour = "white") {
  // Zeichnet das Raumschiff auf den Canvas.
  ctx.strokeStyle = colour;
  ctx.lineWidth = shipSize / 20;
  ctx.beginPath();
  ctx.moveTo(
    x + (4 / 3) * ship.r * Math.cos(a),
    y - (4 / 3) * ship.r * Math.sin(a)
  );
  ctx.lineTo(
    x - ship.r * ((2 / 3) * Math.cos(a) + Math.sin(a)),
    y + ship.r * ((2 / 3) * Math.sin(a) - Math.cos(a))
  );
  ctx.lineTo(
    x - ship.r * ((2 / 3) * Math.cos(a) - Math.sin(a)),
    y + ship.r * ((2 / 3) * Math.sin(a) + Math.cos(a))
  );
  ctx.closePath();
  ctx.stroke();
}

function explodeShip() {
  // Startet die Explosion des Raumschiffs.
  ship.explodeTime = Math.ceil(shipExplodeDur * fps);
  fxExplode.play();
}

function gameOver() {
  // Zeigt den Game Over-Text an und markiert das Raumschiff als zerstört.
  ship.dead = true;
  text = "Game Over";
  textAlpha = 1.0;
}
// Die Funktionen distBetweenPoints, drawShip, explodeShip und gameOver haben spezifische Aufgaben im Spiel:
// distBetweenPoints berechnet den Abstand zwischen zwei Punkten.
// drawShip zeichnet das Raumschiff auf den Canvas.
// explodeShip startet die Explosion des Raumschiffs und spielt den Explosionssound ab.
// gameOver markiert das Raumschiff als zerstört und zeigt den entsprechenden Text im Spiel an.

function keyDown(ev) {
  // Event-Handler für Tastendrücke. Steuert die Bewegung und das Schießen des Raumschiffs.
  if (ship.dead) {
    return;
  }

  switch (ev.keyCode) {
    case 32:
      // Leertaste: Feuert den Laser ab.
      shootLaser();
      break;
    case 37:
      // Pfeil nach links: Dreht das Raumschiff nach links.
      ship.rot = ((shipTurnSpd / 180) * Math.PI) / fps;
      break;
    case 38:
      // Pfeil nach oben: Aktiviert den Schub des Raumschiffs.
      ship.thrusting = true;
      break;
    case 39:
      // Pfeil nach rechts: Dreht das Raumschiff nach rechts.
      ship.rot = ((-shipTurnSpd / 180) * Math.PI) / fps;
      break;
  }
}

function keyUp(ev) {
  // Event-Handler für das Loslassen von Tasten. Stoppt die Bewegung des Raumschiffs.
  if (ship.dead) {
    return;
  }

  switch (ev.keyCode) {
    case 32:
      // Leertaste: Ermöglicht das erneute Schießen des Lasers.
      ship.canShoot = true;
      break;
    case 37:
    case 39:
      // Pfeil nach links oder rechts: Stoppt die Drehung des Raumschiffs.
      ship.rot = 0;
      break;
    case 38:
      // Pfeil nach oben: Deaktiviert den Schub des Raumschiffs.
      ship.thrusting = false;
      break;
  }
}

function newAsteroid(x, y, r) {
  // Erstellt einen neuen Asteroiden mit den angegebenen Koordinaten und Größe.
  const lvlMult = 1 + 0.1 * level;
  const roid = {
    x: x,
    y: y,
    xv:
      ((Math.random() * roidSpd * lvlMult) / fps) *
      (Math.random() < 0.5 ? 1 : -1),
    yv:
      ((Math.random() * roidSpd * lvlMult) / fps) *
      (Math.random() < 0.5 ? 1 : -1),
    a: Math.random() * Math.PI * 2,
    r: r,
    offs: [],
    vert: Math.floor(Math.random() * (roidVert + 1) + roidVert / 2),
  };

  for (let i = 0; i < roid.vert; i++) {
    roid.offs.push(Math.random() * roidJag * 2 + 1 - roidJag);
  }

  return roid;
}

function newGame() {
  // Setzt das Spiel auf den Anfangszustand zurück.
  level = 0;
  lives = gameLives;
  score = 0;
  ship = newShip();

  const scoreStr = localStorage.getItem(saveKeyScore);
  scoreHigh = scoreStr ? parseInt(scoreStr) : 0;

  newLevel();
}
// Die Funktionen keyDown, keyUp, newAsteroid und newGame sind verantwortlich für die Steuerung des Raumschiffs und die Initialisierung des Spiels.

function newLevel() {
  // Startet ein neues Level im Spiel.
  music.setAsteroidRatio(1);
  text = "Level " + (level + 1);
  textAlpha = 1.0;
  createAsteroidBelt();
}

function newShip() {
  // Erstellt ein neues Raumschiff für den Spieler.
  return {
    x: canv.width / 2,
    y: canv.height / 2,
    a: (90 / 180) * Math.PI,
    r: shipSize / 2,
    blinkNum: Math.ceil(shipInvDur / shipBlinkDur),
    blinkTime: Math.ceil(shipBlinkDur * fps),
    canShoot: true,
    dead: false,
    explodeTime: 0,
    lasers: [],
    rot: 0,
    thrusting: false,
    thrust: {
      x: 0,
      y: 0,
    },
  };
}

function shootLaser() {
  // Lässt das Raumschiff einen Laserstrahl abfeuern.
  if (ship.canShoot && ship.lasers.length < laserMax) {
    ship.lasers.push({
      x: ship.x + (4 / 3) * ship.r * Math.cos(ship.a),
      y: ship.y - (4 / 3) * ship.r * Math.sin(ship.a),
      xv: (laserSpd * Math.cos(ship.a)) / fps,
      yv: (-laserSpd * Math.sin(ship.a)) / fps,
      dist: 0,
      explodeTime: 0,
    });
    fxLaser.play();
  }

  ship.canShoot = false;
}

function Music(srcLow, srcHigh) {
  // Definiert die Musikklasse mit niedriger und hoher Tonhöhe.
  this.soundLow = new Audio(srcLow);
  this.soundHigh = new Audio(srcHigh);
  this.low = true;
  this.tempo = 1.0;
  this.beatTime = 0;

  this.play = function () {
    // Spielt die Musik ab, abhängig von der aktuellen Tonhöhe.
    if (musicOn) {
      if (this.low) {
        this.soundLow.play();
      } else {
        this.soundHigh.play();
      }
      this.low = !this.low;
    }
  };

  this.setAsteroidRatio = function (ratio) {
    // Passt die Geschwindigkeit der Musik anhand des Asteroidenverhältnisses an.
    this.tempo = 1.0 - 0.75 * (1.0 - ratio);
  };

  this.tick = function () {
    // Tick-Funktion für die Musik, um den Beat zu halten.
    if (this.beatTime == 0) {
      this.play();
      this.beatTime = Math.ceil(this.tempo * fps);
    } else {
      this.beatTime--;
    }
  };
}
// Die Funktionen newLevel, newShip, shootLaser und die Music-Klasse haben spezifische Aufgaben im Spielablauf:
// newLevel startet ein neues Level und initialisiert die Anzeige.
// newShip erstellt ein neues Raumschiff mit den festgelegten Eigenschaften.
// shootLaser lässt das Raumschiff einen Laserstrahl abfeuern.
// Die Music-Klasse steuert die Hintergrundmusik und passt die Geschwindigkeit an das Spiel an.
// Konstruktorfunktion für die Verwaltung von Soundeffekten

function Sound(src, maxStreams = 1, vol = 1.0) {
  this.streamNum = 0;
  this.streams = [];
  // Erzeuge Audio-Streams basierend auf maxStreams und setze ihre Lautstärke
  for (let i = 0; i < maxStreams; i++) {
    this.streams.push(new Audio(src));
    this.streams[i].volume = vol;
  }

  // Funktion zum Abspielen des Soundeffekts
  this.play = function () {
    if (soundOn) {
      this.streamNum = (this.streamNum + 1) % maxStreams;
      this.streams[this.streamNum].play();
    }
  };

  // Funktion zum Stoppen des Soundeffekts
  this.stop = function () {
    this.streams[this.streamNum].pause();
    this.streams[this.streamNum].currentTime = 0;
  };
}

// Aktualisierungs Funktion für das spiel
function update() {
  const blinkOn = ship.blinkNum % 2 == 0;
  const exploding = ship.explodeTime > 0;

  // ticker für die Musik
  music.tick();

  // zeichne den Hintergrund
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canv.width, canv.height);

  // zeichne die asteroids
  let a, r, x, y, offs, vert;
  for (let i = 0; i < roids.length; i++) {
    ctx.strokeStyle = "slategrey";
    ctx.lineWidth = shipSize / 20;

    // hol die Eigenschaften für die aktuelle Asteroid
    a = roids[i].a;
    r = roids[i].r;
    x = roids[i].x;
    y = roids[i].y;
    offs = roids[i].offs;
    vert = roids[i].vert;

    // zeichne den pfade
    ctx.beginPath();
    ctx.moveTo(x + r * offs[0] * Math.cos(a), y + r * offs[0] * Math.sin(a));

    // zeichne die polygonen
    for (let j = 1; j < vert; j++) {
      ctx.lineTo(
        x + r * offs[j] * Math.cos(a + (j * Math.PI * 2) / vert),
        y + r * offs[j] * Math.sin(a + (j * Math.PI * 2) / vert)
      );
    }
    ctx.closePath();
    ctx.stroke();

    // zeige asteroiden kollision kreis
    if (showBounding) {
      ctx.strokeStyle = "lime";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, false);
      ctx.stroke();
    }
  }

  // bewege das raumschiff
  if (ship.thrusting && !ship.dead) {
    ship.thrust.x += (shipThrust * Math.cos(ship.a)) / fps;
    ship.thrust.y -= (shipThrust * Math.sin(ship.a)) / fps;
    fxThrust.play();

    // zeichne die schubflamme
    if (!exploding && blinkOn) {
      ctx.fillStyle = "red";
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = shipSize / 10;
      ctx.beginPath();
      ctx.moveTo(
        // hinten links
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
      );
      ctx.lineTo(
        // hintere linie (boden vom schiff)
        ship.x - ((ship.r * 5) / 3) * Math.cos(ship.a),
        ship.y + ((ship.r * 5) / 3) * Math.sin(ship.a)
      );
      ctx.lineTo(
        // hinten rechts
        ship.x - ship.r * ((2 / 3) * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
        ship.y + ship.r * ((2 / 3) * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    // Reibung anwenden (das Schiff verlangsamen, wenn es nicht stößt)
    ship.thrust.x -= (friction * ship.thrust.x) / fps;
    ship.thrust.y -= (friction * ship.thrust.y) / fps;
    fxThrust.stop();
  }

  // zeichne das dreieckige schiff
  if (!exploding) {
    if (blinkOn && !ship.dead) {
      drawShip(ship.x, ship.y, ship.a);
    }

    // behandle blinken
    if (ship.blinkNum > 0) {
      // reduziere die blinken zeit
      ship.blinkTime--;

      // reduziere die blinken nummer
      if (ship.blinkTime == 0) {
        ship.blinkTime = Math.ceil(shipBlinkDur * fps);
        ship.blinkNum--;
      }
    }
  } else {
    // Zeichne die Explosion (konzentrische Kreise in verschiedenen Farben)
    ctx.fillStyle = "darkred";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
    ctx.fill();
  }

  // zeige asteroiden kollision kreis
  if (showBounding) {
    ctx.strokeStyle = "lime";
    ctx.beginPath();
    ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
    ctx.stroke();
  }

  // mittel (punkt) vom schiff
  if (showCentreDot) {
    ctx.fillStyle = "red";
    ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
  }

  // zeichne den laser
  for (let i = 0; i < ship.lasers.length; i++) {
    if (ship.lasers[i].explodeTime == 0) {
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        shipSize / 15,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    } else {
      // aussehen der explosion
      ctx.fillStyle = "orangered";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.75,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = "salmon";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.5,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
      ctx.fillStyle = "pink";
      ctx.beginPath();
      ctx.arc(
        ship.lasers[i].x,
        ship.lasers[i].y,
        ship.r * 0.25,
        0,
        Math.PI * 2,
        false
      );
      ctx.fill();
    }
  }

  //zeichne den spiel text
  if (textAlpha >= 0) {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, " + textAlpha + ")";
    ctx.font = "small-caps " + textSize + localFont;
    ctx.fillText(text, canv.width / 2, canv.height * 0.75);
    textAlpha -= 1.0 / textFadeTime / fps;
  } else if (ship.dead) {
    // wenn du game over bist startet danach ein neues spiel
    newGame();
  }

  // draw the lives
  let lifeColour;
  for (let i = 0; i < lives; i++) {
    lifeColour = exploding && i == lives - 1 ? "red" : "white";
    drawShip(
      shipSize + i * shipSize * 1.2,
      shipSize,
      0.5 * Math.PI,
      lifeColour
    );
  }

  // zeichne den aktuellen score
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = textSize + localFont ;
  ctx.fillText(score, canv.width - shipSize / 2, shipSize);

  // zeichne highscore funktion
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = textSize * 0.75 + localFont;
  ctx.fillText("BEST " + scoreHigh, canv.width / 2, shipSize);

  // treffer erkennen auf asteroids
  let ax, ay, ar, lx, ly;
  for (let i = roids.length - 1; i >= 0; i--) {
    // nehme eigenschaften der asteroiden
    ax = roids[i].x;
    ay = roids[i].y;
    ar = roids[i].r;

    // laser loop
    for (let j = ship.lasers.length - 1; j >= 0; j--) {
      // nehme laser eigenschaften
      lx = ship.lasers[j].x;
      ly = ship.lasers[j].y;

      // treffer erkennen
      if (
        ship.lasers[j].explodeTime == 0 &&
        distBetweenPoints(ax, ay, lx, ly) < ar
      ) {
        // destroy the asteroid and activate the laser explosion
        destroyAsteroid(i);
        ship.lasers[j].explodeTime = Math.ceil(laserExplodeDur * fps);
        break;
      }
    }
  }

  // prüfe auf asteroiden kollision
  if (!exploding) {
    // nur wenn du nicht blinkst
    if (ship.blinkNum == 0 && !ship.dead) {
      for (let i = 0; i < roids.length; i++) {
        if (
          distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) <
          ship.r + roids[i].r
        ) {
          explodeShip();
          destroyAsteroid(i);
          break;
        }
      }
    }

    // drehe das schiff
    ship.a += ship.rot;

    // bewege das schiff
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
  } else {
    // reduziere die explosion
    ship.explodeTime--;

    // nach der explosion
    if (ship.explodeTime == 0) {
      lives--;
      if (lives == 0) {
        gameOver();
      } else {
        ship = newShip();
      }
    }
  }

  // handle edge of screen
  if (ship.x < 0 - ship.r) {
    ship.x = canv.width + ship.r;
  } else if (ship.x > canv.width + ship.r) {
    ship.x = 0 - ship.r;
  }
  if (ship.y < 0 - ship.r) {
    ship.y = canv.height + ship.r;
  } else if (ship.y > canv.height + ship.r) {
    ship.y = 0 - ship.r;
  }

  // bewegung der laser
  for (let i = ship.lasers.length - 1; i >= 0; i--) {
    // check distance travelled
    if (ship.lasers[i].dist > laserDist * canv.width) {
      ship.lasers.splice(i, 1);
      continue;
    }

    // behandle die explosion
    if (ship.lasers[i].explodeTime > 0) {
      ship.lasers[i].explodeTime--;

      // wann soll der laser verschwinden
      if (ship.lasers[i].explodeTime == 0) {
        ship.lasers.splice(i, 1);
        continue;
      }
    } else {
      // bewege den laser
      ship.lasers[i].x += ship.lasers[i].xv;
      ship.lasers[i].y += ship.lasers[i].yv;

      // wie weit geht der laser
      ship.lasers[i].dist += Math.sqrt(
        Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2)
      );
    }

    // handle edge of screen
    if (ship.lasers[i].x < 0) {
      ship.lasers[i].x = canv.width;
    } else if (ship.lasers[i].x > canv.width) {
      ship.lasers[i].x = 0;
    }
    if (ship.lasers[i].y < 0) {
      ship.lasers[i].y = canv.height;
    } else if (ship.lasers[i].y > canv.height) {
      ship.lasers[i].y = 0;
    }
  }

  // bewege die asteroids
  for (let i = 0; i < roids.length; i++) {
    roids[i].x += roids[i].xv;
    roids[i].y += roids[i].yv;

    // verhalten der astroids off screen
    if (roids[i].x < 0 - roids[i].r) {
      roids[i].x = canv.width + roids[i].r;
    } else if (roids[i].x > canv.width + roids[i].r) {
      roids[i].x = 0 - roids[i].r;
    }
    if (roids[i].y < 0 - roids[i].r) {
      roids[i].y = canv.height + roids[i].r;
    } else if (roids[i].y > canv.height + roids[i].r) {
      roids[i].y = 0 - roids[i].r;
    }
  }
}
