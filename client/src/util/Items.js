/* NOTE: this library sends requests every time you use its functions for now,
 *  but in future will be rewritten to be much more conservative with fetches and will cache items
 *  so they don't have to be re-sent. We will Optimize Later(tm)(promise).
 */
export class Items {
  // the client copy of the items array is stored as this.#items-as requests get made, it's populated
  // _sparsely_ with any data its gotten sent over. This is all done in the update_cache() function,
  // which needs to be called by any functions that get more data from the server.
  #items;
  #ctime;

  // to use, create an instance of the array on page load. It will handle browser caching and such.
  // the argument is the 'ctime' returned by the login/signup api call, and it's fine without it, but
  // that controls if the cache is refreshed.
  constructor(remote_ctime) {
    const ctime = window.localStorage.getItem('dote-ctime') || 0;
    let cache = [];
    try {
      cache = JSON.parse(window.localStorage.getItem('dote-items'));
    } catch {
      // fix it
      window.localStorage.setItem('dote-items', JSON.stringify([]));
    }

    // check if the cache is safe to trust as correct (no other clients modified data)
    // like, if the ctimes are within 15s of each other
    if (15000 /*ms*/ > Math.abs(ctime - remote_ctime)) {
      this.#items = cache;
      this.#ctime = ctime;
    } else {
      // zero it all
      this.#items = [];
      this.#ctime = Date.now();
      window.localStorage.setItem('dote-items', JSON.stringify(this.#items));
      window.localStorage.setItem('dote-ctime', this.#ctime);
    }
  }

  // updates the internal cache and local storage with new items
  #update_cache(new_list) {
    // go over each of the new items
    for (const item of new_list) {
      const id = item.id;
      // assign them DIRECTLY to the cache array in their id slot
      this.#items[id] = item;
    }

    this.#ctime = Date.now();
    // cache in browser storage
    window.localStorage.setItem('dote-items', JSON.stringify(this.#items));
    window.localStorage.setItem('dote-ctime', this.#ctime);
  }

  // Returns the current cached items list
  // A sparse array, with items at their id-so nothing ever at 0
  // NOTE: EVERY single other function that fetches an item will update this cache.
  // So, for instance: the fetch_recursive() function returns a disorganized array; if you want it
  // sorted so the items are at the correct address in the array, simply discard the output of the
  // fetch_recursive() call and call get_cache()
  get_cache() {
    return this.#items;
  }

  // the query function should be called to generate any user veiw
  // there's no way to evaluate this on the client side, so it shouldn't ever be called recursively
  // (unlike all of the other functions/methods of this class)
  //
  // it takes an array of objects, each object representing a criterion to match items
  // those objects require the fields `type` and `logic`, but may require more depending on type
  //
  // logic must currently be either "AND" or "OR" (other operators maybe eventually) and determines
  // if it adds matches to the response or subtracts non-matches
  // (jank: if and only if there's ORs, all items must match at least one of the OR critera)
  //
  // `type` is the kind of criteria; currently supported types are:
  // match - requires `field` and `value`, and matches items where `field` has `value
  // search - requires `field` and `value`, and matches items where `field` contains `value` (substring or array item)
  // recursive - requires `id` and optionally `depth`, and matches items decended from item `id` to depth
  // --root-- I GIVE UP THIS IS STUPID WE DON'T NEED IT TODO: MAKE IT NOT STUPID
  // range - requires `start` and `end`, and matches items where id is inside the range of those (inclusive)
  async query(query) {
    const res = await fetch(`/api/data/query`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: query,
    });

    // the response sends two groups of items; one that matches the query, and one that's tags of items
    // that match the query
    const {matches, adjacent} = await res.json(res);
    this.#update_cache([...matches, ...adjacent]);
    return matches;
  }

  // takes id
  // gives item
  async get_item(id) {
    if (this.#items[id]) return this.#items[id];
    const res = await fetch(`/api/data/recursive?id=${id}&depth=1`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const item = await res.json();
    if (item[0]) this.#update_cache(item);
    return item[0];
  }

  // takes a start and end id (inclusive) of items and gets every id in between
  // returns the matched array
  async fetch_range(first, last) {
    const res = await fetch(`/api/data/range?first=${first}&last=${last}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const range = await res.json();
    if (range) this.#update_cache(range); // no overwrite bad resp
    return range;
  }

  // takes an id and a depth to recurse on
  // returns an out of order array containing all the matched items
  // depth starts at 1; to return only the root item, use depth=1, for root+children, depth=2, and so on
  // if depth=0, fetches depth=1000 (as many as reasonably possible)
  async get_recursive(id, depth) {
    // function breadth_first_recursive_search(id, depth) {}
    const res = await fetch(`/api/data/recursive?id=${id}&depth=${depth}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });

    const bundle = await res.json();
    if (bundle) this.#update_cache(bundle);
    return bundle;
  }

  // returns an item by uuid
  async get_by_uuid(uuid) {
    const match = this.#items.find((item) => item.uuid == uuid);
    if (match) return match;

    // searches may need to fallback to serverside
    const res = await fetch(`/api/data/uuid/${uuid}`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    });
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes an object containing the fields and values to give the new item (ids and such are generated serverside)
  // returns the created item, with those fields
  async create(fields) {
    const res = await fetch(`/api/data/create/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: {fields},
    });
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes an id, and an object containing the fields and values to reassign the item
  // returns the modified item
  async modify(id, fields) {
    const res = await fetch(`/api/data/modify/`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: {id, fields},
    });
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes a uuid(for safety) and completely deletes the item
  async delete(uuid) {
    await fetch(`/api/data/uuid/${uuid}`, {
      method: 'DELETE',
      headers: {'Content-Type': 'application/json'},
    });

    // we need to totally reset the cache here bc the ids will alll get shuffled
    // probably trigger some sort of refresh, but that's front(er) end stuff
    // for now just:
    this.#items = [];
    this.#update_cache();
  }
}
