import express from "express";
import db from "../db/connection.js";
import { ObjectId } from "mongodb";

const router = express.Router();
//Handle OBJECT_ID as per MongoDB's unique id type
let OBJECT_ID_RE = /^[a-f\d]{24}$/i;
let NUM_RE = /^[0-9]{1,4}$/;

router.get("/", async (req, res) => {
  let page = Math.abs(parseInt(req.query.page, 10)) || 1;
  let size = Math.abs(parseInt(req.query.size, 10)) || 5;
  let collection = await db.collection("books");
  try {
    let toSkip = (page - 1) * size;
    let results = await collection.find({}).limit(size).skip(toSkip).toArray();
    //If page number has no content, return 404
    if (!results.length) {
      res.status(404).send("Page not found");
    } else {
      res.status(200).send({
        page,
        size,
        results
      });
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Error finding books");
  }
});

router.get("/:id", async (req, res) => {
  let collection = await db.collection("books");
  let result, query, idNotFound;
  /*
    Handle other calls on the route. As per the PRD they will overlap with :id. 
    Alternate way is to make id into /book/:id to keep the route separate
  */
 //Handles /search?
  if (req.params.id === "search") {
    let query = req.query.title ? { title: req.query.title } : { author: req.query.author };
    result = await collection.find(query).toArray();
    if (!result.length) {
      result = null;
    }
  }
  //Handles /stats 
  else if (req.params.id === "stats") {
    let bookCollection = await collection.find({}).toArray();
    let yearSorted = bookCollection.sort((a,b) => (a.publicationYear - b.publicationYear));
    let titleLengthSorted = bookCollection.sort((a,b) => (a.title.length - b.title.length));
    result = {
      total_books: bookCollection.length,
      earliest_published: yearSorted[0],
      lastest_published: yearSorted[yearSorted.length - 1],
      shortest_title: titleLengthSorted[0],
      longest_title: titleLengthSorted[titleLengthSorted.length - 1]
    }
  } 
  //Handles /:id
  else {
    if (OBJECT_ID_RE.test(req.params.id)) {
      query = { _id: new ObjectId(req.params.id) };
      result = await collection.findOne(query);
    } else {
      idNotFound = true;
    }
  }
  if (idNotFound) {
    res.status(422).send("Invalid ID type");
  } else {
    if (!result) res.send("Not found").status(404);
    else res.json(result).status(200);
  }
});

router.post("/", async (req, res) => {
  let errorRes = {};

  if (!req.body.title) {
    errorRes.titleErr = "Invalid title"
  }
  if (!req.body.author) {
    errorRes.authorErr = "Invalid author"
  }  
  if (!NUM_RE.test(req.body.publicationYear)) {
    errorRes.yearErr = "Invalid year"
  }

  if (Object.keys(errorRes).length) {
    res.status(422).send(errorRes);
  } else {
    try {
      let newDocument = {
        title: req.body.title,
        author: req.body.author,
        publicationYear: parseInt(req.body.publicationYear),
      };
      let collection = await db.collection("books");
      let result = await collection.insertOne(newDocument);
      res.send(result).status(204);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error adding record");
    }
  }
});

router.put("/:id", async (req, res) => {
  let errorRes = {};
  let fields = {};
  if (req.body.title) {
    fields.title = req.body.title
  }
  if (req.body.author) {
    fields.author = req.body.author
  }  
  if (req.body.publicationYear) {
    if (!NUM_RE.test(req.body.publicationYear)) {
      errorRes.yearErr = "Invalid year";
    } else {
      fields.publicationYear = req.body.publicationYear
    }
  }

  if (!OBJECT_ID_RE.test(req.params.id)) {
    errorRes.idErr = "Invalid ID type";
  } 
  if (Object.keys(errorRes).length) {
    res.status(422).send(errorRes);
  } else {
    try {
      const query = { _id: new ObjectId(req.params.id) };
      const updates = {
        $set: fields,
      };
  
      let collection = await db.collection("books");
      let result = await collection.updateOne(query, updates);
      res.send(result).status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error updating record");
    }
  }
});

router.delete("/:id", async (req, res) => {
  if(!OBJECT_ID_RE.test(req.params.id)) {
    res.status(422).send("Invalid ID type");
  } else {
    try {
      const query = { _id: new ObjectId(req.params.id) };
      const collection = db.collection("books");
      let result = await collection.deleteOne(query);
  
      res.send(result).status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting record");
    }
  }
});

export default router;