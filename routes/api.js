const { auth, add } = require("../lib/users");
const { get_data_from_disk, get_range, get_recursive, get_by_uuid, create, modify, remove } = require("../lib/items");
const auth_middleware = require("../lib/auth");
const router = require('express').Router();


// user stuff
router.post("/login", async (req, res) => {

  if (!req.body.username || !req.body.password) {
      res.status(400).json({ message: 'username or password missing' });
      return;
  }

  const checked_user = await auth(req.body.username, req.body.password);
  if (checked_user) {
    req.session.user = checked_user;

    // lack of error handling is stinky, also ram bloat
    req.session.user.items = await get_data_from_disk(checked_user.uuid);

    res.status(200).json({ username: checked_user.username, uuid: checked_user.uuid, ctime: checked_user.ctime });
  } else {
    res.status(400).json({ message: 'username or password incorrect' });
  }
});

router.post("/signup", async (req, res) => {
  const new_user = await add(req.body.username, req.body.password);
  if (new_user) {
    req.session.user = new_user;

    req.session.user.items = await get_data_from_disk(new_user.uuid); // unneeded but honestly just a sanity check

    res.status(200).json({ username: checked_user.username, uuid: checked_user.uuid, ctime: checked_user.ctime });

  } else {
    res.status(400).json({ message: 'error signing up' });
  }
});



// data stuff
router.get("/data/all", auth_middleware, (req, res) => {
  // shared notes will probably be a seperate file
  // named `${shared_tag_uid}.json`, like the user stores
  // this wouldn't work with that, deal with it when i implement that
  // does that make this not futere proof
  // and ssssstinky?
  res.status(200).json({ data: req.session.user.items });
});

router.get("/data/range", auth_middleware, (req, res) => {
  try {
    const range = get_range(req.session.user, req.query.first, req.query.last)
    res.status(200).json(range || []);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.get("/data/recursive", auth_middleware, (req, res) => {
  try {
    const bundle = get_recursive(req.session.user, req.query.id, req.query.depth)
    res.status(200).json(bundle);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.get("/data/root", auth_middleware, (req, res) => {
  try {
    const bundle = get_root(req.session.user)
    res.status(200).json(bundle || []);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.get("/data/uuid/:uuid", auth_middleware, (req, res) => {
  try {
    const item = get_by_uuid(req.session.user, req.params.uuid)
    res.status(200).json(item || []);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.post("/data/create", auth_middleware, (req, res) => {
  try {
  const item = create(req.session.user, req.body.fields);
  res.status(200).json(item);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.put("/data/modify", auth_middleware, (req, res) => {
  try {
  const item = modify(req.session.user, req.body.id, req.body.fields)
  res.status(200).json(item);
  } catch {
    res.status(400).json({ message: 'internal server error'});
  }
})

router.delete("/data/uuid/:uuid", auth_middleware, (req, res) => {
  const id = get_by_uuid(req.session.user, req.params.uuid).id
  if (id) {
    remove(req.session.user, id)
    res.status(200);
  } else {
    res.status(400).json({ message: 'i don\'t know|i\'m bald|some other infinitely nuanced error'});
  }
})


module.exports = router;
