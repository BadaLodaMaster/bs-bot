const express = require('express');
const mineflayer = require('mineflayer');
const os = require('os');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

let bot1 = null;
let bot2 = null;
let attackInterval1 = null;

app.use(bodyParser.urlencoded({ extended: true }));

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}
const localIP = getLocalIP();

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Secure Bot Control</title>
  <style>
    body {
      background-color: #121212;
      color: white;
      font-family: 'Segoe UI', sans-serif;
      text-align: center;
      padding: 50px;
    }
    input, button {
      padding: 12px 20px;
      margin: 10px;
      font-size: 16px;
      border-radius: 10px;
      border: none;
    }
    input {
      background-color: #1f1f1f;
      color: #fff;
      text-align: center;
    }
    button {
      background-color: #00ffe1;
      color: #000;
      cursor: pointer;
      font-weight: bold;
    }
    #panel {
      display: none;
      margin-top: 40px;
    }
    .section {
      margin-bottom: 40px;
    }
    h1 {
      margin-bottom: 20px;
      color: #00ffe1;
    }
    .error {
      color: red;
    }
  </style>
</head>
<body>
  <h1> Secure Bot Panel</h1>
  <input type="password" id="password" placeholder="Enter password" />
  <button onclick="unlock()">Unlock</button>
  <p id="error" class="error"></p>

  <div id="panel">
    <div class="section">
      <h2> Bot 1 - <span style="color:orange;">BS_Editz</span></h2>
      <button onclick="fetch('/login/1').then(() => alert('Logging in BS_Editz'))">Login</button>
      <button onclick="fetch('/logout/1').then(() => alert('Logging out BS_Editz'))">Logout</button>
    </div>
    <div class="section">
      <h2> Bot 2 - <span style="color:hotpink;">Itx_Mozzy</span></h2>
      <button onclick="fetch('/login/2').then(() => alert('Logging in Itx_Mozzy'))">Login</button>
      <button onclick="fetch('/logout/2').then(() => alert('Logging out Itx_Mozzy'))">Logout</button>
    </div>
  </div>

  <script>
    function unlock() {
      const input = document.getElementById('password').value;
      const panel = document.getElementById('panel');
      const error = document.getElementById('error');

      if (input === 'Jeet@Sujhee') {
        panel.style.display = 'block';
        error.textContent = '';
      } else {
        error.textContent = 'Incorrect password!';
        panel.style.display = 'none';
      }
    }
  </script>
</body>
</html>
`);
});

function setupBot1(bot) {
  bot.once('login', () => {
    console.log(`Bot ${bot.username} logged in`);
    bot.chat('/login Jeet@Rexo210705');
  });

  bot.on('spawn', () => {
    console.log(`Bot ${bot.username} spawned`);
    bot.look(Math.PI / 2, 0, true);
    bot.setQuickBarSlot(4);
    bot.setControlState('sneak', true);

    const attackArmorStand = () => {
      const entity = bot.nearestEntity(e => e.name === 'armor_stand');
      if (entity) {
        try {
          bot.attack(entity);
        } catch (err) {
          console.log(`[${bot.username}] Attack error:`, err.message);
        }
      } else {
        handleArmorStandMissing();
      }
    };

    const handleArmorStandMissing = async () => {
      console.log(`[${bot.username}] Armor stand not found, activating blocks...`);
      bot.setControlState('sneak', false);

      const lever = bot.findBlock({
        matching: block => block.name.includes('lever'),
        maxDistance: 6
      });

      if (lever) {
        try {
          await bot.activateBlock(lever);
          await bot.waitForTicks(20);
          await bot.activateBlock(lever);
        } catch (err) {
          console.log(`[${bot.username}] Lever error:`, err.message);
        }
      }

      const trapdoor = bot.findBlock({
        matching: block => block.name.includes('trapdoor'),
        maxDistance: 6
      });

      if (trapdoor) {
        try {
          await bot.activateBlock(trapdoor);
        } catch (err) {
          console.log(`[${bot.username}] Trapdoor error:`, err.message);
        }
      }

      bot.setControlState('sneak', true);
    };

    attackInterval1 = setInterval(attackArmorStand, 1500);
  });

  bot.on('end', () => console.log(`Bot ${bot.username} disconnected`));
  bot.on('error', err => console.log(`Bot ${bot.username} error:`, err.message));
}

function setupBot2(bot) {
  bot.once('login', () => {
    console.log(`Bot ${bot.username} logged in`);
    bot.chat('/login Jeet@Sujhee');
  });

  bot.on('spawn', () => {
    console.log(`Bot ${bot.username} spawned and will stay crouched.`);
    bot.setQuickBarSlot(4);
    bot.setControlState('sneak', true);
  });

  bot.on('end', () => console.log(`Bot ${bot.username} disconnected`));
  bot.on('error', err => console.log(`Bot ${bot.username} error:`, err.message));
}

app.get('/login/:id', (req, res) => {
  const id = req.params.id;

  if (id === '1') {
    if (bot1) return res.send('Bot 1 already online');
    bot1 = mineflayer.createBot({
      host: 'bucket.qbitnode.com',
      port: 5060,
      username: 'BS_Editz',
      auth: 'offline'
    });
    setupBot1(bot1);
    res.send('Bot 1 logging in...');
  } else if (id === '2') {
    if (bot2) return res.send('Bot 2 already online');
    bot2 = mineflayer.createBot({
      host: 'bucket.qbitnode.com',
      port: 5060,
      username: 'Itx_Mozzy',
      auth: 'offline'
    });
    setupBot2(bot2);
    res.send('Bot 2 logging in...');
  } else {
    res.send('Invalid bot ID');
  }
});

app.get('/logout/:id', (req, res) => {
  const id = req.params.id;

  if (id === '1') {
    if (!bot1) return res.send('Bot 1 not online');
    if (attackInterval1) clearInterval(attackInterval1);
    bot1.quit();
    bot1 = null;
    res.send('Bot 1 logged out');
  } else if (id === '2') {
    if (!bot2) return res.send('Bot 2 not online');
    bot2.quit();
    bot2 = null;
    res.send('Bot 2 logged out');
  } else {
    res.send('Invalid bot ID');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🟢 Bot Web Control running: http://${localIP}:${port}`);
});
