// this file handles fulfilling queries
// important note: the critera 'get' functions expect references to the user's items (comparing them often)
// meaning, NO DEEP COPIES OF ITEMS ANYWHERE IN THIS FILE
// technically fine after the bundle step but that should be the last step


// first/last is the id, not the index, of the first item in the range
function get_range (items, first, last) {
  // verbose math to make clear -1 for id offset and +1 for inclusive, i can't count to 1
  if (first < 1) first = 1;
  const range = items.slice(first - 1, last - 1 + 1);
  if (range.length == 0) return false;
  return range;
}

// get an item and all children recursively, to n depth
function get_recursive (items, target, depth_cap) {
  // if it exists and is between 1-999, keep it, otherwise set 1000
  if (!depth_cap || depth_cap > 1000) depth_cap = 1000; // cap the cap and assume relatively infinite

  // collect items to be sent to the client, in no particular order
  const bundle = []
  // the recursinator
  const recurse = function(id, depth) {
    if (depth >= depth_cap || !items[id-1]) return;
    // no dupes
    if (bundle.includes(items[id-1])) return;

    bundle.push(items[id-1]);

    // recurse on them kids
    for (const kid of items[id-1].children) {
      recurse(kid, depth + 1);
    }
  }
  recurse(target, 0);

  return bundle;
}

// checks items and returns all that have the field matching the value
function get_field_match (items, field, value) {
  if (typeof(value) == 'object') { // if it's not an array that's a you problem
    return items.filter(item => {
      if (typeof(item[field]) != 'object') return false;
      return compare_arrays(item[field], value);
    });
  }
  return items.filter(item => item[field] == value)
}

// looks for string matches in a field
function get_field_search (items, field, value) {
  return items.filter(item => {
    if (typeof(item[field]) == "string") {
      // nnnnnooope
      // shoutout 'noinput', where they on so-4374822 answered something that doesn't force english
      const sanatized = value.replace(/[`!@#$%^&*()|+=?;:'"<>\{\}\[\]\\\/]/gi, '');
      // array.filter janks out if you return a string?
      if (item[field].match(new RegExp(sanatized, 'g'))) return true;

    } else if (typeof(item[field]) == "object") {
      if (item[field].includes(value)) return true;
    }
    return false;
  });
}

// this is a function that should be stock in js. honestly, the choices for what is is asinine to me
function AND_arrays(primary, secondary) {
  return primary.filter(item => secondary.includes(item));
}
function compare_arrays(primary, secondary) {
  if (primary.length != secondary.length) return false;
  for (let i; i >= primary.length; i++) {
    if (secondary[k] != v) return false;
  }
  return true;
}


function AND_query_handler (user, matches, queries) {
  // iterate thru all and call every matcher, then strip down to the AND response
  for (const query of queries) {
    switch (query.type) {
      case 'recursive':
        // support uuid here bc why not, more brainpower went into this comment than the code
        if (query.uuid) {
          query.id = M.get_by_uuid(user, query.uuid)
        }
        matches = AND_arrays(matches, get_recursive(user.items, query.id, query.depth))
        break;

      case 'range':
        matches = AND_arrays(matches, get_range(user.items, query.first, query.last))
        break;

      case 'match':
        matches = AND_arrays(matches, get_field_match(user.items, query.field, query.value))
        break;

      case 'search':
        matches = AND_arrays(matches, get_field_search(user.items, query.field, query.value))
        break;
    }
  }

  return matches;
}

function OR_query_handler (user, matches, queries) {
  // iterate thru all and call every handler
  for (const query of queries) {
    switch (query.type) {
      case 'recursive':
        matches.push(...get_recursive(user.items, query.id, query.depth))
        break;

      case 'range':
        matches.push(...get_range(user.items, query.first, query.last))
        break;

      case 'match':
        matches.push(...get_field_match(user.items, query.field, query.value))
        break;

      case 'search':
        matches.push(...get_field_search(user.items, query.field, query.value))
        break;
    }
  }

  return matches;
}

// modifies the set of bundle items to have the ancestor_tags field, using items as reference
function bundle_adjacent_items (full_items, matches) {
  // create the bundle that gets shipped back to the client
  const bundle = { matches, adjacent: [] };

  // check every item for relationships
  for (const item of matches) {
    for (const child of item.children) { // child is an id
      // no dupes
      if (!bundle.adjacent.includes(full_items[child-1]) && !bundle.matches.includes(full_items[child-1])) {
        bundle.adjacent.push(full_items[child-1]);
      }
    }
    for (const parent of item.parents) {
      if (!bundle.adjacent.includes(full_items[parent-1]) && !bundle.matches.includes(full_items[parent-1])) {
        bundle.adjacent.push(full_items[parent-1]);
      }
    }
  }

  return bundle;
}

function query (user, queries) {
  const OR_queries = [];
  const AND_queries = [];
  for (const query of queries) {
    switch (query.logic) {
      case 'OR':
        OR_queries.push(query);
        break;
      case 'AND':
      default:
        AND_queries.push(query);
        break;
    }
  }
  // if there's OR queries build the array in those queries
  let matches = OR_queries.length > 0 ? OR_query_handler(user, [], OR_queries) : [...user.items];
  // this does mean items have to match at least one OR, but that makes sense to me. i'll change later if it's undesirable.

  // then filter the matches by AND
  if (AND_queries.length > 0) matches = AND_query_handler(user, matches, AND_queries);

  // make a bundle for returning with tags
  return bundle_adjacent_items(user.items, matches)
}


module.exports = {
  query,
  get_range: (user, first, last) => get_range(user.items, first, last),
  get_recursive: (user, id, depth) => get_recursive(user.items, id, depth),
  get_match: (user, field, value) => get_match(user.items, field, value),
  get_search: (user, field, value) => get_search(user.items, field, value),
}
