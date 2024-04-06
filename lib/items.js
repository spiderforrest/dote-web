const { readFile, writeFile } = require("fs/promises");
const { v4 } = require("uuid");
const path = require("path");

const { update_timestamp } = require("./users");


// can anyone tell that i like lua a lot more than js
const M = {};

// distroys the link between a parent and a child both ways
function destroy_relationship(items, parent, child) {
  // and remove this item from the parent's children list
  items[parent-1].children = items[parent-1].children.filter(id => id != child);
  items[child-1].parents = items[child-1].parents.filter(id => id != parent);
}

function create_relationship(items, parent, child) {
  // make sure the field exists
  items[parent-1].children ||= [];
  items[child-1].parents ||= [];

  // add if not present
  if (!items[parent-1].children.includes(child));
    items[parent-1].children.push(child);

  // opposide
  if (!items[child-1].parents.includes(parent));
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

// first/last is the id, not the index, of the first item in the range
M.get_range = function (user, first, last) {
  // verbose math to make clear -1 for id offset and +1 for inclusive, i can't count to 1
  if (first < 1) first = 1;
  const range = user.items.slice(first - 1, last - 1 + 1);
  if (range.length == 0) return false;
  return range;
}

// get item by uuid
M.get_by_uuid = function (user, uuid) {
  return user.items.find(item => item.uuid == uuid);
}

// get specific fields recursively; i.e. get just the titles and relationships of every child of an item
M.get_recursive = function (user, target, depth_cap) {
  if (!depth_cap || depth_cap > 1000) depth_cap = 1000; // cap the cap and assume relatively infinite

  // collect items to be sent to the client, in no particular order
  const bundle = []
  // the recursinator
  const recurse = function(id, depth) {
    if (depth > depth_cap || !user.items[id-1]) return;
    // no dupes
    if (bundle.includes(user.items[id-1])) return;

    bundle.push(user.items[id-1]);

    // recurse on them kids
    if (user.items[id-1].children) {
      for (const kid of user.items[id-1].children) {
        recurse(kid, depth + 1);
      }
    }
  }
  recurse(target, 0);

  return bundle;
}

M.get_root_items = function (user) {
  const bundle = [];
  for (item of user.items) {
    if (!item.parents?.length > 0) bundle.push(item);
  }

  return bundle;
}

// create a new item, and set any given fields
M.create = function (user, fields) {
  // set required fields
  fields.type = fields.type || "todo";
  fields.created = Date.now();
  fields.id = data.length + 1; // ids start from 1 reminder
  fields.uuid = v4();

  // handle relationships
  if (fields.children)
    fields.children.forEach(child => create_relationship(user.items, fields.id, child));
  if (fields.parents)
    fields.parents.forEach(parent => create_relationship(user.items, parent, fields.id));

  user.items.push(fields);
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
    // just completely destroy the old tree, idk if there's been several changes
    user.items[id-1]?.children.forEach(child => destroy_relationship(user.items, fields.id, child));
    // and regrow it
    fields.children.forEach(child => create_relationship(user.items, fields.id, child));
  }
  if (fields.parents) {
    user.items[id-1]?.parents.forEach(parent => destroy_relationship(user.items, parent, fields.id));
    fields.parents.forEach(parent => create_relationship(user.items, parent, fields.id));
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
