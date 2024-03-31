const { readFile, writeFile } = require("fs");
const { v4 } = require('uuid');
const bcrypt = require("bcrypt");
const path = require("path");


// to entirely be rewritten, this is just quick and as dirty as it gets to work on other stuff
// like seriously i should rename this bad_code.js to shame myself into implementing an actual db or something


const user_store_path = path.join(process.env.STORE_DIR, process.env.USER_STORE);
let user_store = [];


function initialize() {
  readFile(user_store_path, (error, data) => {
    if (error) console.log(error, "Failed to read the user store!");
    user_store = JSON.parse(data);
  });
}
initialize();

function get() {
  return user_store;
}

async function add(username, password) {
  if (user_store.find((user) => user.username == username)) {
    // duplicate username, do better later
    return false;
  }

  const user = {
    username,
    password: await bcrypt.hash(password, 10),
    uuid: v4(),
    ctime: Date.now()
  }
  user_store.push(user);

  // stinkyyyyyy
  writeFile(user_store_path, JSON.stringify(user_store),
    error => {
      if (error) console.log(error, "Failed to write the user store!")
    }
  );

  // even more stinkyer
  // make user store

  // note there's a comma for path merging and also a + for just string merging
  // those brackets are an empty json file lmao
  writeFile(path.join(process.env.STORE_DIR, user.uuid + ".json"), "[]",
    error => {
      if (error) console.log(error, "Failed to create the user datafile!")
    }
  );

  // this is the most stinkyerest code, the user files can fail and the user will already be logged in
  return user;
}

// updates the last time the user modified their data to now
function update_timestamp(uuid) {
  const idx = user_store.findIndex( e => e.uuid == uuid );

  user_store[idx].ctime = Date.now();

  writeFile(user_store_path, JSON.stringify(user_store),
    error => {
      if (error) console.log(error, "Failed to write the user store!")
    }
  );
}

function remove() {
}

// verifies a users credentials and returns their user object
async function auth(username, password) {
  const user = user_store.find((user) => user.username == username);

  if (!user) return false;

  const result = await bcrypt.compare(password, user.password)
  if (result) return user;
  return false;
}

module.exports = { get, add, update_timestamp, remove, auth }
