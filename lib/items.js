const { readFile, writeFile } = require("fs/promises");
const { v4 } = require("uuid");
const path = require("path");

const { update_timestamp } = require("./users")


async function get_data_from_disk(uuid) {
  try {
    const result = await readFile(path.join(process.env.STORE_DIR, uuid + ".json"));
    return JSON.parse(result);
  } catch (error) {
    console.log(error, `Failed to load user ${uuid} datafile!`);
    return '[]'; // do better, stink
  }
}

async function save_data_to_disk(user) {
  // mark as changed
  update_timestamp(user.uuid);
  try {
    await writeFile(path.join(process.env.STORE_DIR, user.uuid + ".json"), JSON.stringify(user.items));
  } catch (error) {
    console.log(error, `Failed to write user ${uuid} datafile!`);
  }
}

// first/last is the id, not the index, of the first item in the range
function get_range(user, first, last) {
  // verbose math to make clear -1 for id offset and +1 for inclusive, i can't count to 1
  const range = user.items.slice(first - 1, last - 1 + 1);
  if (range.length == 0) return false;
  return range;
}

// get item by uuid
function get_by_uuid(user, uuid) {
  return user.items.find(item => item.uuid == uuid);
}

// get specific fields recursively; i.e. get just the titles and relationships of every child of an item
function get_recursive(user, target, depth_cap) {
  if (!depth_cap || depth_cap > 1000) depth_cap = 1000; // cap the cap and assume relatively infinite

  // collect items to be sent to the client, in no particular order
  const bundle = []
  // the recursinator
  const recurse = function(id, depth) {
    if (depth > depth_cap || !user.items[id]) return;
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

// create a new item, and set any given fields
function create(user, fields) {
  // set required fields
  fields.type = fields.type || "todo";
  fields.created = Date.now();
  fields.id = data.length + 1; // see stinky comment below
  fields.uuid = v4();

  user.items.push(fields);
  save_data_to_disk(user);
}

function modify(user, id, fields) {
  delete fields.uuid; // forcably clear out the id fields, not manually reassignable
  delete fields.id;

  // use object spread to merge the two, prioritizing the new changes
  // if you're wondering abt the -1, it's because there's no item with id 0
  // if you're wondering why, don't
  // stinky? stinky.
  user.items[id-1] = { ...user.items[id-1], ...fields };

  save_data_to_disk(user);
  return user.items[id-1];
}

function remove(user, id) {
  // go through every parent the item we're removing has
  for (const parent_id of user.items[id-1]?.parents) {
    // and remove this item from the parent's children list
    user.items[parent_id-1].children = user.items[parent_id-1]?.children.filter(child => child != id)
  }
  // same but opposite
  for (const parent_id of user.items[id-1]?.children) {
    user.items[parent_id-1].parents = user.items[parent_id-1]?.parents.filter(child => child != id)
  }

  // TODO: save item to a trash file

  // actually delete the item
  user.items.splice(id-1, 1)

  // repair the damage that just did yipee
}

module.exports = { get_data_from_disk, save_data_to_disk, get_range, get_recursive, get_by_uuid, create, modify, remove };
