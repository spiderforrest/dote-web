const { readFile, writeFile } = require("fs/promises");
const { v4 } = require("uuid");
const path = require("path");

const { update_timestamp } = require("./users");


// can anyone tell that i like lua a lot more than js
const M = {};

// distroys the link between a parent and a child both ways
function destroy_relationship(items, parent, child) {
  console.log(items, parent, child)
  // and remove this item from the parent's children list
  items[parent-1].children = items[parent-1].children.filter(id => id != child);
  items[child-1].parents = items[child-1].parents.filter(id => id != parent);
}

function create_relationship(items, parent, child) {
  // add if not present
  if (!items[parent-1].children.includes(child))
  items[parent-1].children.push(child);


  // opposide
  if (!items[child-1].parents.includes(parent))
  items[child-1].parents.push(parent);
}

M.get_data_from_disk = async function (uuid) {
  try {
    const result = await readFile(path.join(process.env.STORE_DIR, uuid + ".json"));
    return JSON.parse(result);
  } catch (error) {
    console.log(error, `Failed to load user ${uuid} datafile!`);
    return '[]'; // do better, stink
  }
}

M.save_data_to_disk = async function (user) {
  // mark as changed
  update_timestamp(user.uuid);
  try {
    await writeFile(path.join(process.env.STORE_DIR, user.uuid + ".json"), JSON.stringify(user.items));
  } catch (error) {
    // todo: tell the client
    console.log(error, `Failed to write user ${uuid} datafile!`);
  }
}

// get item by uuid
M.get_by_uuid = function (user, uuid) {
  return user.items.find(item => item.uuid == uuid);
}


// create a new item, and set any given fields
M.create = function (user, fields) {
  // set required fields
  fields.type = fields.type || "todo";
  fields.created = Math.floor(Date.now() / 1000);
  fields.id = user.items.length + 1; // ids start from 1 reminder
  fields.uuid = v4();
  fields.done = fields.done || false

  // create the new item
  user.items.push(fields);

  // handle relationships
  if (fields.children) {
    fields.children.forEach(child => create_relationship(user.items, fields.id, child));
  } else {
    fields.children = [];
  }
  if (fields.parents) {
    fields.parents.forEach(parent => create_relationship(user.items, parent, fields.id));
  } else {
    fields.parents = [];
  }

  M.save_data_to_disk(user);
  return fields;
}

M.modify = function (user, id, fields) {
  delete fields.uuid; // forcably clear out the id fields, not manually reassignable
  delete fields.id;


  // handle id fields
  // this overwrites the old list entirely with the new one, so fields.[children|parents] should have all
  // relationships that are wanted, including the old and unchanged ones.
  if (fields.children) {
    console.log(user.items[id-1])
    // just completely destroy the old tree, idk if there's been several changes
    user.items[id-1].children.forEach(child => destroy_relationship(user.items, id, child));
    // and regrow it
    fields.children.forEach(child => create_relationship(user.items, id, child));
  }
  if (fields.parents) {
    user.items[id-1].parents.forEach(parent => destroy_relationship(user.items, parent, id));
    fields.parents.forEach(parent => create_relationship(user.items, parent, id));
  }

  // use object spread to merge the two, prioritizing the new changes
  // if you're wondering abt the -1, it's because there's no item with id 0
  // if you're wondering why, don't
  // stinky? stinky.
  user.items[id-1] = { ...user.items[id-1], ...fields };

  M.save_data_to_disk(user);
  return user.items[id-1];
}

M.remove = function (user, id) {
  // go through every parent the item we're removing has
  for (const child of user.items[id-1].parents) {
    // and remove this item from the parent's children list
    destroy_relationship(user.items, child, id);
  }
  // same but opposite
  for (const child of user.items[id-1].children) {
    destroy_relationship(user.items, id, child);
  }

  // TODO: save item to a trash file

  // actually delete the item
  user.items.splice(id-1, 1);

  // repair the damage that just did yipee

  // create a list of transforms to reference when reassigning id references
  const swaps = [];
  for (const [item, index] of user.items) {
    // we're making an array that's actually k:v pairs like an object, just all numerical
    // the key is where it used to be, and the value is where it currently is/the new id/address
    swaps[item.id-1] = index;
  }

  // swap every id in id list type fields in every item
  for (const [_,index] of user.items) {
    // set the item's id itself to its new address
    user.items[index].id = swaps[index] + 1; // ids start at one reminder

    // fix the references
    // the map looks up the swaps array for the new value, and we save that modified array in place
    user.items[index].children = user.items[index]?.children.map(id => swaps[id]);
    user.items[index].parents = user.items[index]?.parents.map(id => swaps[id]);
  }


  M.save_data_to_disk(user);
}

module.exports = M;
