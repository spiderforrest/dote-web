import { query_handler, get_range, get_recursive } from "./query";

// to use, create an instance of the class on page load, then call instance.initialize(ctime)
// the argument is the 'ctime' returned by the login/signup api call
export class Items {
  // the query function should be called to generate user views
  //
  // it takes an array of objects, each object representing a criterion to match items
  // those objects require the fields `type` and `logic`, but may require more depending on type
  //
  // `logic` must currently be either "AND" or "OR" (other operators maybe eventually) and determines
  // if it adds matches to the response or subtracts non-matches
  // (jank: if and only if there's ORs, all items must match at least one of the OR critera)
  //
  // `type` is the kind of criteria; currently supported types are:
  // match - requires `field` and `value`, and matches items where `field` has `value
  // search - requires `field` and `value`, and matches items where `field` contains `value` (substring or array item)
  // recursive - requires `id` and optionally `depth`, and matches items decended from item `id` to depth
  // range - requires `start` and `end`, and matches items where id is inside the range of those (inclusive)
  query(query) {
    return query_handler(this.#items, query);
  }

  get_all() {
    return this.#items;
  }

  // takes id
  // gives item
  get_item(id) {
    return this.#items[id - 1];
  }

  // takes a start and end id (inclusive) of items and gets every id in between
  // returns the matched array
  get_range(first, last) {
    return get_range(this.#items, first, last);
  }

  // takes an id and a depth to recurse on
  // returns an out of order array containing all the matched items
  // depth starts at 1; to return only the root item, use depth=1, for root+children, depth=2, and so on
  // if depth=0, fetches depth=1000 (as many as reasonable according to me making up a number)
  async get_recursive(id, depth) {
    return get_recursive(this.#items, id, depth);
  }

  // returns an item by uuid
  async get_by_uuid(uuid) {
    return this.#items.find((item) => item.uuid == uuid);
  }

  // takes an object containing the fields and values to give the new item (ids and such are generated serverside)
  // returns the created item, with those fields
  async create(fields) {
    const res = await fetch(`/api/data/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { fields },
    });
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes an id, and an object containing the fields and values to reassign the item
  // returns the modified item
  async modify(id, fields) {
    const res = await fetch(`/api/data/modify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { id, fields },
    });
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes a uuid(for safety) and completely deletes the item
  async delete(uuid) {
    await fetch(`/api/data/uuid/${uuid}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    // we need to totally reset the cache here bc the ids will alll get shuffled
    // probably trigger some sort of refresh, but that's front(er) end stuff
    // for now just:
    this.#items = [];
    this.#update_cache();
  }

  // internal

  #items;
  #ctime;
  #user;
  async initialize(remote_ctime) {
    const ctime = window.localStorage.getItem("dote-ctime") || 0;
    let cache = [];
    try {
      cache = JSON.parse(window.localStorage.getItem("dote-items"));
    } catch {
      // fix it
      window.localStorage.setItem("dote-items", JSON.stringify([]));
    }

    // check if the cache is safe to trust as correct (no other clients modified data)
    // like, if the ctimes are within 15s of each other
    if (15000 /*ms*/ > Math.abs(ctime - remote_ctime)) {
      this.#items = cache;
      this.#ctime = ctime;
    } else {
      // reset it all
      let res = await fetch(`/api/userdata`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      res = await res.json();

      this.#user = res.user;
      this.#items = res.items;
      this.#ctime = Date.now();
      window.localStorage.setItem("dote-items", JSON.stringify(this.#items));
      window.localStorage.setItem("dote-ctime", this.#ctime);
    }
    return this.#items;
  }

  // updates the internal cache and local storage with new items
  #update_cache(new_list) {
    // go over each of the new items
    for (const item of new_list) {
      const id = item.id;
      // assign them to the cache array in their id slot (offset ofc)
      this.#items[id - 1] = item;
    }

    this.#ctime = Date.now();
    // cache in browser storage
    window.localStorage.setItem("dote-items", JSON.stringify(this.#items));
    window.localStorage.setItem("dote-ctime", this.#ctime);
  }
}
