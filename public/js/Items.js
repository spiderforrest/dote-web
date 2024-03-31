class Items {
  // the client copy of the items array is stored as this.#items-as requests get made, it's populated
  // _sparsely_ with any data its gotten sent over. This is all done in the update_cache() function,
  // which needs to be called by any functions that get more data from the server.
  #items;
  #ctime;
  constructor(remote_ctime) {
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
    if (15000 > Math.abs(ctime - remote_ctime)) {
      this.#items = cache;
      this.#ctime = ctime;
    } else {
      // zero it all
      this.#items = [];
      this.#ctime = Date.now();
      window.localStorage.setItem("dote-items", JSON.stringify(this.#items));
      window.localStorage.setItem("dote-ctime", this.#ctime);
    }
  }

  // updates the internal cache and local storage with new items
  #update_cache(new_list) {
    console.log(new_list)
    // go over each of the new items
      for(const item of new_list) {
      const id = item.id;
      // assign them DIRECTLY to the cache array in their id slot
      this.#items[id - 1] = item;
    }

    this.#ctime = Date.now();
    // cache in browser storage
    window.localStorage.setItem("dote-items", JSON.stringify(this.#items));
    window.localStorage.setItem("dote-ctime", this.#ctime)
  }

  get_cache() {
    return this.#items;
  }
  // first/last is the id, not the index, of the first item in the range
  async fetch_range(first, last) {
    const res = await fetch(`/api/data/range?first=${first}&last=${last}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const range = await res.json()
    if (range) this.#update_cache(range); // no overwrite bad resp
    return range;
  }


  async fetch_recursive(id, depth) {
    const res = await fetch(`/api/data/range?id=${id}&depth=${depth}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const bundle = await res.json()
    if (bundle) this.#update_cache(bundle);
    return bundle;
  }

  // returns an item by uuid
  async find_uuid(uuid) {
    const match = this.#items.find(item => item?.uuid == uuid);
    if (match) return match;

    // searches may need to fallback to serverside
    const res = await fetch(`/api/data/uuid/${uuid}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const item = await res.json();

    if (item) this.#update_cache([item]);
    return item;
  }

  // creates an item
  async create(fields) {
    const res = await fetch(`/api/data/create/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { fields }
    })
    const item = await res.json()

    if (item) this.#update_cache([item]);
    return item;
  }

  // takes an item's id and an object with k:v pairs for field:value to overwrite the items fields
  async modify(id, fields) {
    const res = await fetch(`/api/data/modify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { id, fields }
    })
    const item = await res.json()

    if (item) this.#update_cache([item]);
    return item;
  }

  // completely deletes an item, by uuid for safety
  async delete_item(uuid) {
    await fetch(`/api/data/uuid/${uuid}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    // we need to totally reset the cache here bc the ids will alll get shuffled
    // probably trigger some sort of refresh, but that's front(er) end stuff
    // for now just:
    this.#items = [];
  }
}
